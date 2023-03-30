import videojs from 'video.js';
import IPFS from 'ipfs-core';
import Web3 from 'web3';
import _ from 'lodash';

// Connect to the user's wallet
const web3 = new Web3(window.ethereum);

// Get the user's wallet address
const userAddress = await web3.eth.getAccounts()[0];

// Connect to IPFS
const ipfs = await IPFS.create();

// Set up your own contract instance
const contractAddress = '0x123456789abcdef...';
const contractABI = [/* your contract ABI */];
const contractInstance = new web3.eth.Contract(contractABI, contractAddress);

// Create a new Video.js player
const player = videojs('my-player', {
  controls: true,
  autoplay: false,
  preload: 'auto',
});

// Retrieve an array of media NFTs from the user's wallet
const mediaNfts = await contractInstance.methods.getMediaNfts(userAddress).call();

// Get an array of CIDs from the user's media NFTs
const cids = await Promise.all(mediaNfts.map(async (nft) => {
  const tokenId = nft.tokenId;
  const tokenURI = await contractInstance.methods.tokenURI(tokenId).call();
  const metadata = await (await fetch(tokenURI)).json();
  return metadata.cid;
}));

// Shuffle the array of CIDs
const shuffledCids = _.shuffle(cids);

// Play each media file in the shuffled order
for (let i = 0; i < shuffledCids.length; i++) {
  await playMediaFromIPFS(shuffledCids[i]);
}

async function playMediaFromIPFS(cid) {
  const file = await ipfs.cat(cid);

  // Determine the media file type from the CID
  const type = cid.split('.').pop();

  // Convert the file to a Blob
  let blob;
  if (type === 'mp4') {
    blob = new Blob([file], { type: 'video/mp4' });
  } else if (type === 'webm') {
    blob = new Blob([file], { type: 'video/webm' });
  } else if (type === 'mp3') {
    blob = new Blob([file], { type: 'audio/mp3' });
  } else if (type === 'wav') {
    blob = new Blob([file], { type: 'audio/wav' });
  } else {
    throw new Error(`Unsupported media file type: ${type}`);
  }

  // Convert the Blob to a URL
  const url = URL.createObjectURL(blob);

  // Play the media file in the player
  player.src(url);
  player.play();
}

// Pause the player
player.pause();

// Play the player
player.play();

// Stop the player
player.pause();
player.currentTime(0);

// Repeat the current media file
player.loop(true);

// Shuffle the array of CIDs
const shuffledCids = _.shuffle(cids);
