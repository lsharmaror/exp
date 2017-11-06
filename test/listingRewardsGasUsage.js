var ListingRewards = artifacts.require("./ListingRewards.sol");
const ether = require("./helpers/ether");
const assertJump = require("./helpers/assertJump");
const log = require("./helpers/logger");

contract("ListingRewards - GAS USAGE", accounts => {
	let listing;
	const owner = accounts[0];
	const listee1 = accounts[1];
	const listee2 = accounts[2];
	const veto1 = accounts[3];
	const veto2 = accounts[4];
	const veto3 = accounts[5];
	const veto4 = accounts[6];
	beforeEach(async () => {
		listing = await ListingRewards.new(owner, ether(2), ether(2));
	});

	it("newRewardRequest, flagListing, voteInFavorOfListing and vetosInFavorPayout gas usage", async () => {
	    await listing
	      .newRewardRequest(1, { from: listee1, value: ether(2)})
	      .then(tx => {
	        log(`New Reward request ${tx.receipt.gasUsed} gas`);
	      });
	    await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
	        log(`FlagListing request ${tx.receipt.gasUsed} gas`);
	      });
	    await listing.voteInFavorOfListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
	        log(`Vote In Favor Of Request ${tx.receipt.gasUsed} gas`);
	      });
	    await web3.currentProvider.sendAsync(
	          {
	            jsonrpc: "2.0",
	            method: "evm_increaseTime",
	            params: [86400 * 8], // 86400 seconds in a day
	            id: new Date().getTime()
	          },
	          () => {}
	        );
	    await listing.vetosInFavorPayout(listee1, { from: veto2 }).then(tx => {
	      log(`Vetos In Favor Payout request ${tx.receipt.gasUsed} gas`);
	      });
	    await listing.vetosInFavorPayout(listee1, { from: listee1 }).then(tx => {
	      log(`Vetos In Favor Payout request ${tx.receipt.gasUsed} gas`);
	      });
	});

	it("voteAgainstListing and vetosAgainstPayout gas usage", async () => {
    await listing
      .newRewardRequest(1, { from: listee1, value: ether(2)});
    await listing.flagListing(listee1, { from: veto1, value: ether(0.2) });
    await listing.voteAgainstListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
        log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
      });
    await web3.currentProvider.sendAsync(
          {
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [86400 * 8], // 86400 seconds in a day
            id: new Date().getTime()
          },
          () => {}
        );
    await listing.vetosAgainstPayout(listee1, { from: veto2 }).then(tx => {
      log(`Vetos Against Payout request ${tx.receipt.gasUsed} gas`);
      });
	});

	it("cancelRewardRequest gas usage", async () => {
    await listing
      .newRewardRequest(1, { from: listee1, value: ether(2)});
    await listing.cancelRewardRequest({ from: listee1 }).then(tx => {
        log(`Cancel Reward Request ${tx.receipt.gasUsed} gas`);
      });
  });

  it("listeePayout gas usage", async () => {
    await listing
      .newRewardRequest(1, { from: listee1, value: ether(2)});
    await web3.currentProvider.sendAsync(
          {
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [86400 * 15], // 86400 seconds in a day
            id: new Date().getTime()
          },
          () => {}
        );
    await listing.listeePayout({ from: listee1 }).then(tx => {
        log(`Listee Payout Request ${tx.receipt.gasUsed} gas`);
      });
  });

  it("vetosTiePayout gas usage", async () => {
    await listing
      .newRewardRequest(1, { from: listee1, value: ether(2)});
    await listing.flagListing(listee1, { from: veto1, value: ether(0.2) });
    await web3.currentProvider.sendAsync(
          {
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [86400 * 11], // 86400 seconds in a day
            id: new Date().getTime()
          },
          () => {}
        );
    await listing.vetosTiePayout(listee1, { from: veto1 }).then(tx => {
      log(`Vetos Tie Payout request ${tx.receipt.gasUsed} gas`);
      });
    await listing.vetosTiePayout(listee1, { from: listee1 }).then(tx => {
      log(`Vetos Tie Payout request ${tx.receipt.gasUsed} gas`);
      });
	});

});
