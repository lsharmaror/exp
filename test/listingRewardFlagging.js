var ListingRewards = artifacts.require("./ListingRewards.sol");
const ether = require("./helpers/ether");
const assertJump = require("./helpers/assertJump");
const log = require("./helpers/logger");

contract("ListingRewards - FLAGGING", accounts => {
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

	//FLAG ListingRewards
	it("Flagging a listing", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: ether(2) })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
	});
	it("Flagging own listing", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: ether(2) })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.flagListing(listee1, { from: listee1, value: ether(0.2) }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Flagging a listing with no deposit", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: ether(2) })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.flagListing(listee1, { from: veto1 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Flagging cancelled listing", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: ether(2) })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.cancelRewardRequest({ from: listee1 }).then(tx => {
				log(`Cancel new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Flagging a flagged listing", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: ether(2) })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
		await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Flagging an invalid listing", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: ether(2) })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing("0x00", { from: veto1, value: ether(0.2) }).then(tx => {
					log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Checking number of votes after flagging", async () => { 
		await listing
			.newRewardRequest(1, { from: listee1, value: ether(2) })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteInFavorOfListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
        		log(`Vote in favor of Request request ${tx.receipt.gasUsed} gas`);
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
		let voteForListing;
			await listing.getNumberOfVotesInFavor(listee1).then((a) => {
				voteForListing = a.logs[0].args.number.c[0];
			});
			let voteAgainst;
			await listing.getNumberOfVotesAgainst(listee1).then((a) => {
				voteAgainst = a.logs[0].args.number.c[0];
			});
		assert.equal(voteForListing, 2);
		assert.equal(voteAgainst, 1);
	});
	it("Flagging a listing after 14 days", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: ether(2) })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await web3.currentProvider.sendAsync(
				{
					jsonrpc: "2.0",
					method: "evm_increaseTime",
					params: [86400 * 15], // 86400 seconds in a day
					id: new Date().getTime()
				},
				() => {}
			);
			await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
					log(`Flag request ${tx.receipt.gasUsed} gas`);
				});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
});
