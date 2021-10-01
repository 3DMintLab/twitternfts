const S = await import('@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib.js')
const _Buffer = (await import('buffer/')).Buffer

const Loader = {
  Cardano: S
}
import CoinSelection from "../wallet/coinSelection.mjs";

export async function getProtocolParameters() {
  var HOST = process.env.NODE_ENV === 'development' ? process.env.API : location.origin;
  const latest_block = await fetch(HOST+'/blocks_latest', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'GET'
  }).then((response) => response.json());
  var slotnumber = latest_block.slot;
  
  const p = await fetch(`${HOST}/parameters`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'GET'
  }).then((response) => response.json());
  if (p.status >= 400 && p.status < 600) {
      throw new Error("Bad response from server");
  }

  var value = {
      linearFee: S.LinearFee.new(
      S.BigNum.from_str(p.min_fee_a.toString()),
      S.BigNum.from_str(p.min_fee_b.toString())
      ),
      minUtxo: S.BigNum.from_str(p.min_utxo),
      poolDeposit: S.BigNum.from_str(p.pool_deposit),
      keyDeposit: S.BigNum.from_str(p.key_deposit),
      maxTxSize: p.max_tx_size,
      slot: slotnumber,
  };
  return value;
};

async function createLockingPolicyScript(protocolParameters) {
    const slot = parseInt(protocolParameters.slot);
    const ttl = slot + 1000;
    const address = _Buffer.from(
      (await window.cardano.getUsedAddresses())[0],
      "hex"
    );
    const paymentKeyHash = Loader.Cardano.BaseAddress.from_address(
      Loader.Cardano.Address.from_bytes(address)
    )
      .payment_cred()
      .to_keyhash();
    const nativeScripts = Loader.Cardano.NativeScripts.new();
    const script = Loader.Cardano.ScriptPubkey.new(paymentKeyHash);
    const nativeScript = Loader.Cardano.NativeScript.new_script_pubkey(script);
    const lockScript = Loader.Cardano.NativeScript.new_timelock_expiry(
      Loader.Cardano.TimelockExpiry.new(ttl)
    );
    nativeScripts.add(nativeScript);
    nativeScripts.add(lockScript);
    const finalScript = Loader.Cardano.NativeScript.new_script_all(
      Loader.Cardano.ScriptAll.new(nativeScripts)
    );
    const policyId = _Buffer.from(
      Loader.Cardano.ScriptHash.from_bytes(
        finalScript.hash().to_bytes()
      ).to_bytes(),
      "hex"
    ).toString("hex");
    return { id: policyId, script: finalScript, ttl };
}

async function submitTx(signedTx) {
const txHash = await window.cardano.submitTx(
    _Buffer.from(signedTx.to_bytes(), "hex").toString("hex")
);
return txHash;
}

async function signTx(transaction) {
    //await Loader.load();
    const witnesses = await window.cardano.signTx(
      _Buffer.from(transaction.to_bytes(), "hex").toString("hex")
    );
    const txWitnesses = transaction.witness_set();
    const txVkeys = txWitnesses.vkeys();
    const txScripts = txWitnesses.scripts();

    const addWitnesses = Loader.Cardano.TransactionWitnessSet.from_bytes(
        _Buffer.from(witnesses, "hex")
    );
    const addVkeys = addWitnesses.vkeys();
    const addScripts = addWitnesses.scripts();

    const totalVkeys = Loader.Cardano.Vkeywitnesses.new();
    const totalScripts = Loader.Cardano.NativeScripts.new();

    if (txVkeys) {
      for (let i = 0; i < txVkeys.len(); i++) {
        totalVkeys.add(txVkeys.get(i));
      }
    }
    if (txScripts) {
      for (let i = 0; i < txScripts.len(); i++) {
        totalScripts.add(txScripts.get(i));
      }
    }
    if (addVkeys) {
      for (let i = 0; i < addVkeys.len(); i++) {
        totalVkeys.add(addVkeys.get(i));
      }
    }
    if (addScripts) {
      for (let i = 0; i < addScripts.len(); i++) {
        totalScripts.add(addScripts.get(i));
      }
    }

    const totalWitnesses = Loader.Cardano.TransactionWitnessSet.new();
    totalWitnesses.set_vkeys(totalVkeys);
    totalWitnesses.set_scripts(totalScripts);

    const signedTx = await Loader.Cardano.Transaction.new(
      transaction.body(),
      totalWitnesses,
      transaction.metadata()
    );
    return signedTx;
}

const assetsCount = async (multiAssets) => {
//await Loader.load();
if (!multiAssets) return 0;
let count = 0;
const policies = multiAssets.keys();
for (let j = 0; j < multiAssets.len(); j++) {
    const policy = policies.get(j);
    const policyAssets = multiAssets.get(policy);
    const assetNames = policyAssets.keys();
    for (let k = 0; k < assetNames.len(); k++) {
    count++;
    }
}
return count;
};
  
const amountToValue = async (assets) => {
  //await Loader.load();
  const multiAsset = Loader.Cardano.MultiAsset.new();
  const lovelace = assets.find((asset) => asset.unit === "lovelace");
  const policies = [
    ...new Set(
      assets
        .filter((asset) => asset.unit !== "lovelace")
        .map((asset) => asset.unit.slice(0, 56))
    ),
  ];
  console.log(assets)
  console.log(policies)
  policies.forEach((policy) => {
    const policyAssets = assets.filter(
      (asset) => asset.unit.slice(0, 56) === policy
    );
    const assetsValue = Loader.Cardano.Assets.new();
    policyAssets.forEach((asset) => {
      assetsValue.insert(
        Loader.Cardano.AssetName.new(_Buffer.from(asset.unit.slice(56), "hex")),
        Loader.Cardano.BigNum.from_str(asset.quantity)
      );
    });
    multiAsset.insert(
      Loader.Cardano.ScriptHash.from_bytes(_Buffer.from(policy, "hex")),
      assetsValue
    );
  });
  const value = Loader.Cardano.Value.new(
    Loader.Cardano.BigNum.from_str(lovelace ? lovelace.quantity : "0")
  );
  if (assets.length > 1 || !lovelace) value.set_multiasset(multiAsset);
  return value;
};
  
const hexToAscii = (hex) => {
  var _hex = hex.toString();
  var str = "";
  for (var i = 0; i < _hex.length && _hex.substr(i, 2) !== "00"; i += 2)
    str += String.fromCharCode(parseInt(_hex.substr(i, 2), 16));
  return str;
};
  
const asciiToHex = (str) => {
  var arr = [];
  for (var i = 0, l = str.length; i < l; i++) {
    var hex = Number(str.charCodeAt(i)).toString(16);
    arr.push(hex);
  }
  return arr.join("");
};
  

// call this function
/**
 * 
 *  await MintTx(
 *    {
 *        name: "MyToken",
 *        quantity: "20",
 *        metadata: {
 *            image: "...",
 *            "...": "..."
 *        }
 *    }
 *  )
 * 
 * 
 * 
 */
export async function MintTx(metadata) {
  const protocolParameters = await getProtocolParameters();
  const policy = await createLockingPolicyScript(protocolParameters)

  let name = metadata.name.slice(0,32)

  const assets =  [{name: name, quantity: metadata.quantity.toString()}]

  const METADATA = {
      [policy.id]: {
          [name.slice(0,32)]: {
              ...metadata.metadata
          }
      }
  }
  console.log(METADATA)
  
  try {

    const transaction = await mintTx(assets,METADATA,policy,protocolParameters)
    const signedTx = await signTx(transaction)
    const txHash = await submitTx(signedTx);
    return txHash;
    } catch (error) {
      console.log(error)
      return {error: error.info || error.toString()}
    }
  // const metadata = METADATA
}

async function mintTx(assets, metadata, policy, protocolParameters) {
  
  const address = _Buffer.from(
    (await window.cardano.getUsedAddresses())[0],
    "hex"
  );

  const checkValue = await amountToValue(
    assets.map((asset) => ({
      unit: policy.id + asciiToHex(asset.name),
      quantity: asset.quantity,
    }))
  );
  
  const minAda = Loader.Cardano.min_ada_required(
    checkValue,
    protocolParameters.minUtxo
  );
  let value = Loader.Cardano.Value.new(Loader.Cardano.BigNum.from_str("2000000"));
  const _outputs = Loader.Cardano.TransactionOutputs.new();
  _outputs.add(
    Loader.Cardano.TransactionOutput.new(
      Loader.Cardano.Address.from_bytes(address),
      Loader.Cardano.Value.new(minAda)
    )
  );
  const utxos = (await window.cardano.getUtxos()).map((utxo) =>
    Loader.Cardano.TransactionUnspentOutput.from_bytes(
      _Buffer.from(utxo, "hex")
    )
  );
  CoinSelection.setProtocolParameters(
    protocolParameters.minUtxo.to_str(),
    protocolParameters.linearFee.coefficient().to_str(),
    protocolParameters.linearFee.constant().to_str(),
    protocolParameters.maxTxSize.toString()
  );
  const selection = await CoinSelection.randomImprove(utxos, _outputs, 20);
  const nativeScripts = Loader.Cardano.NativeScripts.new();
  nativeScripts.add(policy.script);
  const mintedAssets = Loader.Cardano.Assets.new();
  assets.forEach((asset) => {
    mintedAssets.insert(
      Loader.Cardano.AssetName.new(_Buffer.from(asset.name)),
      Loader.Cardano.BigNum.from_str(asset.quantity)
    );
  });
  const mintedValue = Loader.Cardano.Value.new(
    Loader.Cardano.BigNum.from_str("0")
  );
  const multiAsset = Loader.Cardano.MultiAsset.new();
  multiAsset.insert(
    Loader.Cardano.ScriptHash.from_bytes(policy.script.hash().to_bytes()),
    mintedAssets
  );
  mintedValue.set_multiasset(multiAsset);
  value = value.checked_add(mintedValue);

  const mint = Loader.Cardano.Mint.new();
  const mintAssets = Loader.Cardano.MintAssets.new();
  assets.forEach((asset) => {
    mintAssets.insert(
      Loader.Cardano.AssetName.new(_Buffer.from(asset.name)),
      Loader.Cardano.Int.new(Loader.Cardano.BigNum.from_str(asset.quantity))
    );
  });
  mint.insert(
    Loader.Cardano.ScriptHash.from_bytes(
      policy.script
        .hash(Loader.Cardano.ScriptHashNamespace.NativeScript)
        .to_bytes()
    ),
    mintAssets
  );

  const inputs = Loader.Cardano.TransactionInputs.new();
  selection.input.forEach((utxo) => {
    inputs.add(
      Loader.Cardano.TransactionInput.new(
        utxo.input().transaction_id(),
        utxo.input().index()
      )
    );
    value = value.checked_add(utxo.output().amount());
  });

  const rawOutputs = Loader.Cardano.TransactionOutputs.new();
  rawOutputs.add(
    Loader.Cardano.TransactionOutput.new(
      Loader.Cardano.Address.from_bytes(address),
      value
    )
  );
  const fee = Loader.Cardano.BigNum.from_str("0");

  const rawTxBody = Loader.Cardano.TransactionBody.new(
    inputs,
    rawOutputs,
    fee,
    policy.ttl
  );
  rawTxBody.set_mint(mint);

  let _metadata;
  if (metadata) {
    const generalMetadata = Loader.Cardano.GeneralTransactionMetadata.new();
    generalMetadata.insert(
      Loader.Cardano.BigNum.from_str("721"),
      Loader.Cardano.encode_json_str_to_metadatum(JSON.stringify(metadata))
    );
    _metadata = Loader.Cardano.TransactionMetadata.new(generalMetadata);

    rawTxBody.set_metadata_hash(Loader.Cardano.hash_metadata(_metadata));
  }

  const witnesses = Loader.Cardano.TransactionWitnessSet.new();
  witnesses.set_scripts(nativeScripts);

  const dummyVkeyWitness =
    "8258208814c250f40bfc74d6c64f02fc75a54e68a9a8b3736e408d9820a6093d5e38b95840f04a036fa56b180af6537b2bba79cec75191dc47419e1fd8a4a892e7d84b7195348b3989c15f1e7b895c5ccee65a1931615b4bdb8bbbd01e6170db7a6831310c";

  const vkeys = Loader.Cardano.Vkeywitnesses.new();
  vkeys.add(
    Loader.Cardano.Vkeywitness.from_bytes(
      _Buffer.from(dummyVkeyWitness, "hex")
    )
  );
  vkeys.add(
    Loader.Cardano.Vkeywitness.from_bytes(
      _Buffer.from(dummyVkeyWitness, "hex")
    )
  );
  witnesses.set_vkeys(vkeys);

  const rawTx = Loader.Cardano.Transaction.new(
    rawTxBody,
    witnesses,
    _metadata
  );

  let minFee = Loader.Cardano.min_fee(rawTx, protocolParameters.linearFee);

  // value = value.checked_sub(Loader.Cardano.Value.new(minFee));

  const outputs = Loader.Cardano.TransactionOutputs.new();
  outputs.add(
    Loader.Cardano.TransactionOutput.new(
      Loader.Cardano.Address.from_bytes(address),
      value
    )
  );

  const finalTxBody = Loader.Cardano.TransactionBody.new(
    inputs,
    outputs,
    minFee,
    policy.ttl
  );
  finalTxBody.set_mint(rawTxBody.multiassets());
  finalTxBody.set_metadata_hash(rawTxBody.metadata_hash());

  const finalWitnesses = Loader.Cardano.TransactionWitnessSet.new();
  finalWitnesses.set_scripts(nativeScripts);

  const transaction = Loader.Cardano.Transaction.new(
    finalTxBody,
    finalWitnesses,
    rawTx.metadata()
  );

  const size = transaction.to_bytes().length * 2;
  if (size > protocolParameters.maxTxSize) throw ERROR.txTooBig;

  return transaction;
}