// var ListingRewards = artifacts.require("./ListingRewards.sol");
// const assertJump = require("./helpers/assertJump");
// const log = require("./helpers/logger");

// contract("ListingRewards - NEW LISTING", accounts => {
// 	let listing;
// 	const owner = accounts[0];
// 	const listee1 = accounts[1];
// 	const listee2 = accounts[2];
// 	const veto1 = accounts[3];
// 	const veto2 = accounts[4];
// 	const veto3 = accounts[5];
// 	const veto4 = accounts[6];
// 	beforeEach(async () => {
// 		listing = await ListingRewards.new(owner, 20, 20);
// 	});

//   it("Checking veto2 rating after winning veto", async () => {
//     await listing
//       .newRewardRequest(1, { from: listee1, value: 20 })
//       .then(tx => {
//         log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
//       });
//     await listing.flagListing(listee1, { from: veto1, value: 2 }).then(tx => {
//         log(`Flag request ${tx.receipt.gasUsed} gas`);
//       });
//     await listing.voteInFavorOfListing(listee1, { from: veto2, value: 2 }).then(tx => {
//         log(`Vote in favor of Request request ${tx.receipt.gasUsed} gas`);
//       });
//     await web3.currentProvider.sendAsync(
//           {
//             jsonrpc: "2.0",
//             method: "evm_increaseTime",
//             params: [86400 * 8], // 86400 seconds in a day
//             id: new Date().getTime()
//           },
//           () => {}
//         );
//     await listing.vetosInFavorPayout(listee1, { from: veto2 })
//      .then(tx => {
//        	log(`In favor payout request ${tx.receipt.gasUsed} gas`);
//       });
//     let rating11 = await listing.getUserRating.call(veto2);
//     assert.equal(rating11, 100);
//     });

// 	  it("Checking listee1 rating after winning veto", async () => {
//     await listing
//       .newRewardRequest(1, { from: listee1, value: 20 })
//       .then(tx => {
//         log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
//       });
//     await listing.flagListing(listee1, { from: veto1, value: 2 }).then(tx => {
//         log(`Flag request ${tx.receipt.gasUsed} gas`);
//       });
//     await listing.voteInFavorOfListing(listee1, { from: veto2, value: 2 }).then(tx => {
//         log(`Vote in favor of Request request ${tx.receipt.gasUsed} gas`);
//       });
//     await web3.currentProvider.sendAsync(
//           {
//             jsonrpc: "2.0",
//             method: "evm_increaseTime",
//             params: [86400 * 8], // 86400 seconds in a day
//             id: new Date().getTime()
//           },
//           () => {}
//         );
//     await listing.vetosInFavorPayout(listee1, { from: listee1 }).then(tx => {
//       log(`In favor payout request ${tx.receipt.gasUsed} gas`);
//       });
//     let rating11 = await listing.getUserRating.call(listee1);
//     assert.equal(rating11, 100);
//   });

//     it("Checking listee1, listee2, veto1, veto2 and veto3 rating after winning veto", async () => {
//     await listing
//       .newRewardRequest(1, { from: listee1, value: 20 })
//       .then(tx => {
//         log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
//       });
//     await listing
//       .newRewardRequest(1, { from: listee2, value: 20 })
//       .then(tx => {
//         log(`Adding second reward request ${tx.receipt.gasUsed} gas`);
//       });
//     await listing.flagListing(listee1, { from: veto1, value: 2 }).then(tx => {
//         log(`Flag request ${tx.receipt.gasUsed} gas`);
//       });
//     await listing.flagListing(listee2, { from: veto1, value: 2 }).then(tx => {
//         log(`Flag request ${tx.receipt.gasUsed} gas`);
//       });
//     await listing.voteAgainstListing(listee1, { from: veto2, value: 2 }).then(tx => {
//         log(`Vote against Request request ${tx.receipt.gasUsed} gas`);
//       });
//     await listing.voteInFavorOfListing(listee2, { from: veto3, value: 2 }).then(tx => {
//         log(`Vote in favor of Request request ${tx.receipt.gasUsed} gas`);
//       });
//     await web3.currentProvider.sendAsync(
//           {
//             jsonrpc: "2.0",
//             method: "evm_increaseTime",
//             params: [86400 * 8], // 86400 seconds in a day
//             id: new Date().getTime()
//           },
//           () => {}
//         );
//     await listing.vetosAgainstPayout(listee1, { from: veto2 }).then(tx => {
//       log(`Against payout request ${tx.receipt.gasUsed} gas`);
//       });
//     await listing.vetosInFavorPayout(listee2, { from: veto3 }).then(tx => {
//       log(`Against payout request ${tx.receipt.gasUsed} gas`);
//       });
//     await listing.vetosInFavorPayout(listee2, { from: listee2 }).then(tx => {
//       log(`Against payout request ${tx.receipt.gasUsed} gas`);
//       });
//     await listing.vetosAgainstPayout(listee1, { from: veto1 }).then(tx => {
//       log(`Against payout request ${tx.receipt.gasUsed} gas`);
//       });
//     let rating1 = await listing.getUserRating.call(listee1);
//     let rating2 = await listing.getUserRating.call(listee2);
//     let rating3 = await listing.getUserRating.call(veto1);
//     let rating4 = await listing.getUserRating.call(veto2);
//     let rating5 = await listing.getUserRating.call(veto3);
//     assert.equal(rating1, 0);
//     assert.equal(rating2, 100);
//     assert.equal(rating3, 50);
//     assert.equal(rating4, 100);
//     assert.equal(rating5, 100);
//   });

// });
