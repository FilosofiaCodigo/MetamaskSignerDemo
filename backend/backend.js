import createAlchemyWeb3 from "@alch/alchemy-web3"
import sigUtil from "eth-sig-util"
import ethUtil from "ethereumjs-util"
import dotenv from "dotenv"
import fs from "fs"
import cors from "cors"
import express from "express"

const app = express()
dotenv.config();

const CONTRACT_ADDRESS = "0xCONTRACTADDRESSHERE"
const BACKEND_WALLET_ADDRESS = "0xVAULTOWNERADDRESSHERE"
const PORT = 8080
var web3 = null
var contract = null

const loadContract = async (data) => {
  data = JSON.parse(data);
  
  const netId = await web3.eth.net.getId();
  const deployedNetwork = data.networks[netId];

  //var totalSupply = await contract.methods.totalSupply().call()
  //console.log("Contract initialized. Total supply is: " + totalSupply)
}

async function initAPI() {
  const { RINKEBY_RPC_URL, PRIVATE_KEY } = process.env;
  web3 = createAlchemyWeb3.createAlchemyWeb3(RINKEBY_RPC_URL);

  app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`)
  })
  app.use(cors())


  console.log(123123)
  //TODO
  let msgParams = '{"domain":{"chainId":4,"name":"Ether Mail","verifyingContract":"0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC","version":"1"},"message":{"contents":"Hello, Bob!","attachedMoneyInEth":4.2,"from":{"name":"Cow","wallets":["0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826","0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF"]},"to":[{"name":"Bob","wallets":["0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB","0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57","0xB0B0b0b0b0b0B000000000000000000000000000"]}]},"primaryType":"Mail","types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Group":[{"name":"name","type":"string"},{"name":"members","type":"Person[]"}],"Mail":[{"name":"from","type":"Person"},{"name":"to","type":"Person[]"},{"name":"contents","type":"string"}],"Person":[{"name":"name","type":"string"},{"name":"wallets","type":"address[]"}]}}'
  let result_result = "0x0a3c66d2b2af8107380a9483367fbf51435f2559aded27bee08817c4d7ec24e64d949490c70629a446cf8e441d79f468c3bdb9c7e23f3cf610f536afcefc8f251c"
  let from = '0xb6F5414bAb8d5ad8F33E37591C02f7284E974FcB'

  const recovered = sigUtil.recoverTypedSignature_v4({
    data: JSON.parse(msgParams),
    sig: result_result,
  });

  if (
    ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)
  ) {
    console.log('Successfully recovered signer as ' + from);
  } else {
    console.log(
      'Failed to verify signer when comparing ' + result + ' to ' + from
    );
  }
}

async function transferCoins(address_beneficiary, amount)
{
  const nonce = await web3.eth.getTransactionCount(BACKEND_WALLET_ADDRESS, 'latest'); // nonce starts counting from 0

  const transaction = {
   'from': BACKEND_WALLET_ADDRESS,
   'to': CONTRACT_ADDRESS,
   'value': 0,
   'gas': 300000,
   'nonce': nonce,
   'data': contract.methods.transfer(address_beneficiary, amount).encodeABI()
  };
  const { RINKEBY_RPC_URL, PRIVATE_KEY } = process.env;
  const signedTx = await web3.eth.accounts.signTransaction(transaction, PRIVATE_KEY);

  web3.eth.sendSignedTransaction(signedTx.rawTransaction, function(error, hash) {
    if (!error) {
      console.log("🎉 The hash of your transaction is: ", hash, "\n");
    } else {
      console.log("❗Something went wrong while submitting your transaction:", error)
    }
  });
}

//http://localhost:8080/exchange?address=0x730bF3B67090511A64ABA060FbD2F7903536321E&points=1234
app.get('/exchange', (req, res) => {
  var address = req.query["address"]
  var points = req.query["points"]
  var message = "Sent " + points + " tokens to " + " " + address
  transferCoins(address, web3.utils.toWei(points))
  res.setHeader('Content-Type', 'application/json');
  res.send({
    "message": message
  })
})
initAPI()
