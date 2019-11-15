const {
  watchForTransaction,
  waitForConfirmations,
  oneInputOneOutputWitnessTX,
  bitcoinSignatureDER,
  addWitnessSignature,

} = require('../src')

const ElectrumClient = require('tbtc-helpers').ElectrumClient
const config = require('../../src/config/config.json')

const bcoin = require('bcoin')
const BN = require('bcrypto/lib/bn')
const chai = require('chai')
const assert = chai.assert

describe('transaction', async () => {
  describe('watchForTransaction', async () => {
    let electrumClient
    let txData

    before(async () => {
      txData = require('tbtc-helpers/test/data/tx.json')

      electrumClient = new ElectrumClient.Client(config.electrum.testnetPublic)

      await electrumClient.connect()
        .catch((err) => {
          throw new Error(`failed to connect electrum client: [${err}]`)
        })
    })

    after(async () => {
      await electrumClient.close()
        .catch((err) => {
          throw new Error(`failed to disconnect from electrum client: [${err}]`)
        })
    })

    it('finds a transaction with expected value', async () => {
      const outputPosition = 0
      const address = txData.outputs[outputPosition].address
      const expectedValue = txData.outputs[outputPosition].value

      const expectedResult = {
        outputPosition: outputPosition,
        transactionID: txData.hash,
        value: txData.outputs[outputPosition].value,
      }

      const result = await watchForTransaction(electrumClient, address, expectedValue)

      assert.deepEqual(result, expectedResult)
    })

    it.skip('finds a transaction but value does not match', async () => {
      // TODO: We should implement this test when we have mocked electrum client.
      // Test scenario:
      // 1. Transaction for script already exists but value doesn't match.
      // 2. Function is waiting for a new transaction to be sent.
      // 3. We mock new transaction being sent and mock the response of unspent
      //    transaction to match the required value.
      // 4. Test passes.
    })
  })

  describe('waitForConfirmations', async () => {
    let electrumClient
    let txData

    before(async () => {
      txData = require('tbtc-helpers/test/data/tx.json')

      electrumClient = new ElectrumClient.Client(config.electrum.testnetPublic)

      await electrumClient.connect()
        .catch((err) => {
          throw new Error(`failed to connect electrum client: [${err}]`)
        })
    })

    after(async () => {
      await electrumClient.close()
        .catch((err) => {
          throw new Error(`failed to disconnect from electrum client: [${err}]`)
        })
    })

    it('succeeds when transaction already has confirmations', async () => {
      const transactionID = txData.hash

      const result = await waitForConfirmations(electrumClient, transactionID)

      assert.isTrue(result >= 1)
    })

    it.skip('waits for enough confirmations', async () => {
      // TODO: We should implement this test when we have mocked electrum client.
      // Transaction has not enough confirmations yet and we wait for a new block
      // to be mined and transaction to get more confirmations.
    })
  })

  // Details of transaction from bitcoin's testnet:
  // https://api.blockcypher.com/v1/btc/test3/txs/872746c236780413366f65073a99387edac30708ec6778ffc304ad1d9c38d2ff
  const tx = {
    unsignedRaw: '0100000001b6b2d3060b6b2ca3cc3daf8e128b218910895d6a050d86b7fc5b8365a149eef1010000000000000000012003000000000000160014c0c4d52d814b12fe517f3d17a42963f77a26a73e00000000',
    signedRaw: '01000000000101b6b2d3060b6b2ca3cc3daf8e128b218910895d6a050d86b7fc5b8365a149eef1010000000000000000012003000000000000160014c0c4d52d814b12fe517f3d17a42963f77a26a73e024730440220734587ade9b1e7ccf89eedd891a7dc7efc88fb50c4482a622448a26ac927184802204991c45d0bff4a3f9229487bec4394d0a787a2c80f04f51f9bd1eb833aff535d012103a71fa2ea8db23ca5e9a40d3227afc4cacadc8ed744b41a17a3765f4e6cb246a500000000',
    hash: 'ffd2389c1dad04c3ff7867ec0807c3da7e38993a07656f3613047836c2462787',
    signatureHash: '2e74f1332dcee0d50b1e3ec27a7f65eee4d7adf76c4bf136e0429bdd548917d4',
  }

  describe('oneInputOneOutputWitnessTX', async () => {
    it('creates transaction', async () => {
      const previousOutpoint = Buffer.from('b6b2d3060b6b2ca3cc3daf8e128b218910895d6a050d86b7fc5b8365a149eef101000000', 'hex')
      const inputSequence = 0
      const outputValue = new BN('800')
      const outputPKH = Buffer.from('c0c4d52d814b12fe517f3d17a42963f77a26a73e', 'hex')

      const expectedHash = tx.hash
      const expectedRawTransaction = tx.unsignedRaw

      const transaction = await oneInputOneOutputWitnessTX(
        previousOutpoint,
        inputSequence,
        outputValue,
        outputPKH,
      )

      assert.deepEqual(transaction, expectedRawTransaction)

      // Deserialize transaction to bcoin TX type.
      const bcoinTransaction = bcoin.TX.fromRaw(transaction, 'hex')

      const transactionHash = bcoinTransaction.hash('hex')

      assert.deepEqual(transactionHash, expectedHash)

      // Validate digest for signing calculation.
      // Expect the same result as [`oneInputOneOutputSighash`](https://github.com/summa-tx/bitcoin-spv/blob/555ed9a9a726644f4ff9efc5c6787c3f587f4d8e/solidity/contracts/CheckBitcoinSigs.sol#L130)
      // function from the `bitcoin-spv` library.
      const expectedSignatureHash = tx.signatureHash

      const inputIndex = 0
      const previousOutputScript = bcoin.Script.fromRaw('76a914ee9b3c2d94144ea81c4604d695836f9b1bc3bb0b88ac', 'hex')
      const previousOutputValue = new BN('1000')

      const signatureHash = bcoinTransaction.signatureHash(
        inputIndex,
        previousOutputScript,
        previousOutputValue.toNumber(),
        bcoin.Script.hashType.ALL,
        1
      )

      assert.deepEqual(signatureHash.toString('hex'), expectedSignatureHash)
    })
  })

  describe('bitcoinSignatureDER', async () => {
    const ZERO = Buffer.from('00', 'hex')
    const CURVE_ORDER = Buffer.from('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 'hex')

    it('rejects r equal to 0', async () => {
      const r = ZERO
      const s = Buffer.from('11111111111111', 'hex')

      assert.throws(() => {
        bitcoinSignatureDER(r, s)
      }, 'Invalid R value.')
    })

    it('rejects s equal to 0', async () => {
      const r = Buffer.from('11111111111111', 'hex')
      const s = ZERO

      assert.throws(() => {
        bitcoinSignatureDER(r, s)
      }, 'Invalid S value.')
    })

    it('rejects r equal to curve\'s order', async () => {
      const r = CURVE_ORDER
      const s = Buffer.from('11111111111111', 'hex')

      assert.throws(() => {
        bitcoinSignatureDER(r, s)
      }, 'Invalid R value.')
    })

    it('rejects s equal to curve\'s order', async () => {
      const r = Buffer.from('11111111111111', 'hex')
      const s = CURVE_ORDER

      assert.throws(() => {
        bitcoinSignatureDER(r, s)
      }, 'Invalid S value.')
    })

    // Test conversion of S value as per [BIP-0062](https://github.com/bitcoin/bips/blob/master/bip-0062.mediawiki#low-s-values-in-signatures).
    it('converts a signature with the lowest s value', async () => {
      const r = Buffer.from('11111111111111', 'hex')
      const s = Buffer.from('01', 'hex')

      const expectedResult = Buffer.from('300c020711111111111111020101', 'hex')

      const result = bitcoinSignatureDER(r, s)

      assert.deepEqual(result, expectedResult)
    })

    it('converts a signature with low s value', async () => {
      const r = Buffer.from('11111111111111', 'hex')
      const s = Buffer.from('7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0', 'hex')

      const expectedResult = Buffer.from('302b02071111111111111102207fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0', 'hex')

      const result = await bitcoinSignatureDER(r, s)

      assert.deepEqual(result, expectedResult)
    })

    it('converts a signature with high s value', async () => {
      const r = Buffer.from('11111111111111', 'hex')
      const s = Buffer.from('7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a1', 'hex')

      const expectedResult = Buffer.from('302b02071111111111111102207fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0', 'hex')

      const result = await bitcoinSignatureDER(r, s)

      assert.deepEqual(result, expectedResult)
    })

    it('converts a signature with the highest s value', async () => {
      const r = Buffer.from('11111111111111', 'hex')
      const s = Buffer.from('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140', 'hex')

      const expectedResult = Buffer.from('300c020711111111111111020101', 'hex')

      const result = await bitcoinSignatureDER(r, s)

      assert.deepEqual(result, expectedResult)
    })
  })

  describe('addWitnessSignature', async () => {
    it('adds signature to the transaction', async () => {
      const unsignedTransaction = Buffer.from(tx.unsignedRaw, 'hex')
      const inputIndex = 0
      const r = Buffer.from('734587ade9b1e7ccf89eedd891a7dc7efc88fb50c4482a622448a26ac9271848', 'hex')
      const s = Buffer.from('b66e3ba2f400b5c06dd6b78413bc6b2e13273a1ea043ab1c240073099536ede4', 'hex')
      const publicKey = Buffer.from('a71fa2ea8db23ca5e9a40d3227afc4cacadc8ed744b41a17a3765f4e6cb246a50cba7be3052b7ea7c3a7f4d730079085f08fe43ef19e176b195f9653e12ec21f', 'hex')

      const expectedRawTransaction = tx.signedRaw

      const transaction = await addWitnessSignature(
        unsignedTransaction,
        inputIndex,
        r,
        s,
        publicKey,
      )

      assert.deepEqual(transaction, expectedRawTransaction)
    })
  })
})
