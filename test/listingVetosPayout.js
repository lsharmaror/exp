var ListingRewards = artifacts.require("./ListingRewards.sol");
const ether = require("./helpers/ether");
const assertJump = require("./helpers/assertJump");
const log = require("./helpers/logger");

contract("ListingRewards - VETOSPAYOUT", accounts => {
	let listing;
	const owner = accounts[0];
	const listee1 = accounts[1];
	const listee2 = accounts[2];
	const veto1 = accounts[3];
	const veto2 = accounts[4];
	const veto3 = accounts[5];
	const veto4 = accounts[6];
  const veto5 = accounts[7];
	beforeEach(async () => {
		listing = await ListingRewards.new(owner, ether(2), ether(2));
	});

  it("Claiming in favor veto payout after voting in favor and winning veto", async () => {
    let balanceBeforePayout = web3.eth.getBalance(veto2);
    let balance = await web3.eth.getBalance(veto2);
    let tx1 = 0;
    await listing
      .newRewardRequest(1, { from: listee1, value: ether(2)})
      .then(tx => {
        log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
      });
    await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
        log(`Flag request ${tx.receipt.gasUsed} gas`);
      });
    await listing.voteInFavorOfListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
        log(`Vote in favor of Request request ${tx.receipt.gasUsed} gas`);
        tx1 += (tx.receipt.gasUsed * 10e10);
      });
    balance = await web3.eth.getBalance(veto2);
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
      log(`In favor payout request ${tx.receipt.gasUsed} gas`);
        tx1 += (tx.receipt.gasUsed * 10e10);
      });
    balance = await web3.eth.getBalance(veto2);
    balance = balance.toString().substring(5);
    balance = parseFloat(balance) + parseFloat(tx1);
    balance = balance.toString().substring(balance.toString().length - 4);
    balanceBeforePayout = balanceBeforePayout.toString().substring(balanceBeforePayout.toString().length - 4);
    assert.equal(parseFloat(balance) - parseFloat(balanceBeforePayout), 0);
  });

  it("Claiming in favor veto payout after voting against", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: ether(2) })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
          log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteAgainstListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
          log(`Vote Against Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosInFavorPayout(listee1, { from: veto2 }).then(tx => {
        log(`In favor payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming against veto payout after voting against and winning veto", async () => {
    let balanceBeforePayout = web3.eth.getBalance(veto2);
    let postString = 0;
    let balance = await web3.eth.getBalance(veto2);
    let tx1 = 0;
    await listing
      .newRewardRequest(1, { from: listee1, value: ether(2) })
      .then(tx => {
        log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
      });
    await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
      log(`Flag request ${tx.receipt.gasUsed} gas`);
      });
    await listing.voteAgainstListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
      log(`Vote Against Request request ${tx.receipt.gasUsed} gas`);
        tx1 += (tx.receipt.gasUsed * 10e10);
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
      log(`Against payout request ${tx.receipt.gasUsed} gas`);
        tx1 += (tx.receipt.gasUsed * 10e10);
      });
    balance = await web3.eth.getBalance(veto2);
    balance = balance.toString().substring(5);
    balance = parseFloat(balance) + parseFloat(tx1);
    balance = balance.toString().substring(balance.toString().length - 4);
    balanceBeforePayout = balanceBeforePayout.toString().substring(balanceBeforePayout.toString().length - 4);
    assert.equal(parseFloat(balance) - parseFloat(balanceBeforePayout), 0);
  });

  it("Claiming against veto payout after voting in favor", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: ether(2) })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
          log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteInFavorOfListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
          log(`Vote In Favor Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosAgainstPayout(listee1, { from: veto2 }).then(tx => {
        log(`Against payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming in favor veto payout after voting in favor and losing veto", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: ether(2) })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
          log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteInFavorOfListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
          log(`Vote In Favor Of Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteAgainstListing(listee1, { from: veto3, value: ether(0.2) }).then(tx => {
          log(`Vote Against Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteAgainstListing(listee1, { from: veto4, value: ether(0.2) }).then(tx => {
          log(`Vote Against Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosInFavorPayout(listee1, { from: veto2 }).then(tx => {
        log(`In favor payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming against veto payout after voting against and losing veto", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: ether(2) })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
          log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteAgainstListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
          log(`Vote In Favor Of Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteInFavorOfListing(listee1, { from: veto3, value: ether(0.2) }).then(tx => {
          log(`Vote In Favor Of Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteInFavorOfListing(listee1, { from: veto4, value: ether(0.2) }).then(tx => {
          log(`Vote In Favor Of Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosInFavorPayout(listee1, { from: veto2 }).then(tx => {
        log(`In favor payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("listee1 claiming against", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: ether(2) })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
          log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosAgainstPayout(listee1, { from: listee1 }).then(tx => {
        log(`Against payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("listee1 claiming in favor of veto payout after losing veto", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: ether(2) })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
          log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteAgainstListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
          log(`Vote Against Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosInFavorPayout(listee1, { from: listee1 }).then(tx => {
        log(`In favor payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("listee1 claiming in favor of veto payout after winning veto", async () => {
    let balanceBeforePayout = await web3.eth.getBalance(listee1);
    let postString = 0;
    let balance = await web3.eth.getBalance(listee1);
    let tx1 = 0;
    await listing
      .newRewardRequest(1, { from: listee1, value: ether(2) })
      .then(tx => {
        log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        tx1 += (tx.receipt.gasUsed * 10e10);
      });
    await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
        log(`Flag request ${tx.receipt.gasUsed} gas`);
      });
    await listing.voteInFavorOfListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
        log(`Vote In Favor Of Request request ${tx.receipt.gasUsed} gas`);
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
    await listing.vetosInFavorPayout(listee1, { from: listee1 }).then(tx => {
      log(`In favor payout request ${tx.receipt.gasUsed} gas`);
        tx1 += (tx.receipt.gasUsed * 10e10);
      });
    balance = await web3.eth.getBalance(listee1);
    balance = balance.toString().substring(5);
    balance = parseFloat(balance) + parseFloat(tx1);
    balance = balance.toString().substring(balance.toString().length - 4);
    balanceBeforePayout = balanceBeforePayout.toString().substring(balanceBeforePayout.toString().length - 4);
    assert.equal(parseFloat(balance) - parseFloat(balanceBeforePayout), 0);
  });

  it("Claiming in favor of veto payout without voting", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: ether(2) })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
          log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosInFavorPayout(listee1, { from: listee1 }).then(tx => {
        log(`In favor payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming against veto payout without voting", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: ether(2) })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
          log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosAgainstPayout(listee1, { from: veto2 }).then(tx => {
        log(`Against payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming in favor of veto payout for an unflagged listee", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: ether(2) })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosInFavorPayout(listee1, { from: veto1 }).then(tx => {
        log(`In favor payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming against veto payout for an unflagged listee", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: ether(2) })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosAgainstPayout(listee1, { from: veto1 }).then(tx => {
        log(`Against payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming in favor of veto payout before 7 days", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: ether(2) })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
        log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteInFavorOfListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
        log(`Vote In Favor Of Request request ${tx.receipt.gasUsed} gas`);
        });
      await web3.currentProvider.sendAsync(
          {
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [86400 * 6], // 86400 seconds in a day
            id: new Date().getTime()
          },
          () => {}
        );
      await listing.vetosInFavorPayout(listee1, { from: veto2 }).then(tx => {
        log(`In favor payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming against veto payout before 7 days", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: ether(2) })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
        log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteAgainstListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
        log(`Vote Against Request request ${tx.receipt.gasUsed} gas`);
        });
      await web3.currentProvider.sendAsync(
          {
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [86400 * 6], // 86400 seconds in a day
            id: new Date().getTime()
          },
          () => {}
        );
      await listing.vetosAgainstPayout(listee1, { from: veto2 }).then(tx => {
        log(`Against payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming in favor of veto payout multiple times", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: ether(2) })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
          log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteInFavorOfListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
          log(`Vote in favor of Request request ${tx.receipt.gasUsed} gas`);
          });
      await listing.vetosInFavorPayout(listee1, { from: veto2 }).then(tx => {
        log(`In favor of payout request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosInFavorPayout(listee1, { from: veto2 }).then(tx => {
        log(`In favor of payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming against veto payout multiple times", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: ether(2) })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
          log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteAgainstListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
          log(`Vote Against Request request ${tx.receipt.gasUsed} gas`);
          });
      await listing.vetosAgainstPayout(listee1, { from: veto2 }).then(tx => {
        log(`Against payout request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosAgainstPayout(listee1, { from: veto2 }).then(tx => {
        log(`Against payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("listee1 claiming in favor of veto payout multiple times", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: ether(2) })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
          log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteInFavorOfListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
          log(`Vote in favor of Request request ${tx.receipt.gasUsed} gas`);
          });
      await listing.vetosInFavorPayout(listee1, { from: listee1 }).then(tx => {
        log(`In favor of payout request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosInFavorPayout(listee1, { from: listee1 }).then(tx => {
        log(`In favor of payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming in favor of veto payout for an invalid listee", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: ether(2) })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
          log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteInFavorOfListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
          log(`Vote in favor of Request request ${tx.receipt.gasUsed} gas`);
          });
      await listing.vetosInFavorPayout(0x00, { from: veto2 }).then(tx => {
        log(`In favor of payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming against veto payout for an invalid listee", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: ether(2) })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
          log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteAgainstListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
          log(`Vote against Request request ${tx.receipt.gasUsed} gas`);
          });
      await listing.vetosAgainstPayout(0x00, { from: veto2 }).then(tx => {
        log(`Against payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("listee1 and veto2 claiming veto payout after a veto tie", async () => {
    let balanceBeforePayout = await web3.eth.getBalance(listee1);
    let balanceBeforePayout1 = await web3.eth.getBalance(veto1);
    let balance = await web3.eth.getBalance(listee1);
    let balance1 = await web3.eth.getBalance(veto1);
    let tx1 = 0;
    let tx2 = 0;
    await listing
      .newRewardRequest(1, { from: listee1, value: ether(2) })
      .then(tx => {
        log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        tx1 += (tx.receipt.gasUsed * 10e10);
      });
    await listing.flagListing(listee1, { from: veto1, value: ether(0.2) }).then(tx => {
        log(`Flag request ${tx.receipt.gasUsed} gas`);
        tx2 += (tx.receipt.gasUsed * 10e10);
      });
    await listing.voteInFavorOfListing(listee1, { from: veto2, value: ether(0.2) }).then(tx => {
        log(`Vote In Favor Of Request request ${tx.receipt.gasUsed} gas`);
      });
    await listing.voteAgainstListing(listee1, { from: veto3, value: ether(0.2) }).then(tx => {
        log(`Vote Against Request request ${tx.receipt.gasUsed} gas`);
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
    await listing.voteAgainstListing(listee1, { from: veto4, value: ether(0.2) }).then(tx => {
        log(`Vote Against Request request ${tx.receipt.gasUsed} gas`);
      });
    await listing.voteInFavorOfListing(listee1, { from: veto5, value: ether(0.2) }).then(tx => {
        log(`Vote In Favor Of Request request ${tx.receipt.gasUsed} gas`);
      });
        await web3.currentProvider.sendAsync(
          {
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [86400 * 3], // 86400 seconds in a day
            id: new Date().getTime()
          },
          () => {}
        );
    await listing.vetosTiePayout(listee1, { from: listee1 }).then(tx => {
      log(`Tie payout request ${tx.receipt.gasUsed} gas`);
        tx1 += (tx.receipt.gasUsed * 10e10);
      });
    await listing.vetosTiePayout(listee1, { from: veto1 }).then(tx => {
      log(`Tie payout request ${tx.receipt.gasUsed} gas`);
        tx2 += (tx.receipt.gasUsed * 10e10);
      });
    balance = await web3.eth.getBalance(listee1);
    balance = balance.toString().substring(5);
    balance = parseFloat(balance) + parseFloat(tx1);
    balance = balance.toString().substring(balance.toString().length - 4);
    balance1 = await web3.eth.getBalance(veto1);
    balance1 = balance1.toString().substring(5);
    balance1 = parseFloat(balance1) + parseFloat(tx2);
    balance1 = balance1.toString().substring(balance1.toString().length - 4);
    balanceBeforePayout = balanceBeforePayout.toString().substring(balanceBeforePayout.toString().length - 4);
    balanceBeforePayout1 = balanceBeforePayout1.toString().substring(balanceBeforePayout1.toString().length - 4);
    assert.equal(parseFloat(balance) - parseFloat(balanceBeforePayout), 0);
    assert.equal(parseFloat(balance1) - parseFloat(balanceBeforePayout1), 0);
  });  

});
