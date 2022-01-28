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

  //TODO
  let from = '0xb6F5414bAb8d5ad8F33E37591C02f7284E974FcB'
  let signature = "0xaa8355a4afdefeb47b5dd3182889b2c2357c6350b26177393f62e8d1ad5eb69b446d73afa55ad07e402a2046afb9bd258c4ead585c407d854bcd83da99d808a61c"

  let data =
  {
    "message":
    {
      "contents":"Message!",
      "security_hash":""
    },
    "primaryType":"Main",
    "types":{
      "Main":[{"name":"contents","type":"string"},
      {"name":"security_hash","type":"string"}]
    }
  }

  data["message"]["security_hash"] = "0x123123"

  const recovered = sigUtil.recoverTypedSignature_v4({
    data: data,
    sig: signature,
  });

  if (
    ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)
  ) {
    console.log('Successfully recovered signer as ' + from);
  } else {
    console.log(
      'Failed to verify signer when comparing result to ' + from
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
