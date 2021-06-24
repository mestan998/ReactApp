import React, {useState} from "react"
import * as fcl from "@onflow/fcl"
import styled from 'styled-components'
import * as t from "@onflow/types"

const Card = styled.div`
  margin: 10px 5px;
  padding: 10px;
  border: 1px solid #c0c0c0;
  border-radius: 5px;
`

const Header = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
`

const Code = styled.pre`
  background: #f0f0f0;
  border-radius: 5px;
  max-height: 300px;
  overflow-y: auto;
  padding: 5px;
`

const simpleTransaction = fcl.cdc`
    import NonFungibleToken from 0x4fc019cea9fc4817
    import KittyItems from 0x4fc019cea9fc4817


    transaction(recipient: Address, typeID: UInt64) {
        
        let minter: &KittyItems.NFTMinter

        prepare(signer: AuthAccount) {
          self.minter = signer.borrow<&KittyItems.NFTMinter>(from: KittyItems.MinterStoragePath)
            ?? panic("Could not borrow a reference to the NFT minter")
        }

        execute {
          let recipient = getAccount(recipient)
          let receiver = recipient
              .getCapability(KittyItems.CollectionPublicPath)!
              .borrow<&{NonFungibleToken.CollectionPublic}>()
              ?? panic("Could not get receiver reference to the NFT Collection")
          self.minter.mintNFT(recipient: receiver, typeID: typeID)           
        }
    }

`

const SendTransaction = () => {
  const [status, setStatus] = useState("Not started")
  const [transaction, setTransaction] = useState(null)

  const sendTransaction = async (event) => {
    event.preventDefault()
    
    setStatus("Resolving...")

    const blockResponse = await fcl.send([
      fcl.getLatestBlock(),
    ])

    const block = await fcl.decode(blockResponse)
    
    try {
      const typeID = 1 
      const recipient = "0x133e1613b8b3aed3"
      console.log(recipient, "address")
      const tx = await fcl.send([
        fcl.transaction(simpleTransaction),
        fcl.proposer(fcl.currentUser().authorization),
        fcl.args([
          fcl.arg(String(recipient), t.Address),
          fcl.arg(Number(typeID), t.UInt64)
        ]),
        fcl.payer(fcl.currentUser().authorization),
        fcl.authorizations([               
          fcl.currentUser().authorization  
        ]),
        fcl.ref(block.id),
      ])

      const { transactionId } = tx

      setStatus(`Transaction (${transactionId}) sent, waiting for confirmation`)

      const unsub = fcl
        .tx(transactionId)
        .subscribe(transaction => {
          setTransaction(transaction)

          if (fcl.tx.isSealed(transaction)) {
            setStatus(`Transaction (${transactionId}) is Sealed`)
            unsub()
          }
        })
    } catch (error) {
      console.error(error)
      setStatus("Transaction failed")
    }
  }

  return (
    <Card>
      <Header>MintNft</Header>
      <Code>{simpleTransaction}</Code>

      <button onClick={sendTransaction}>
        MINT
      </button>

      <Code>Status: {status}</Code>

      {transaction && <Code>{JSON.stringify(transaction, null, 2)}</Code>}
    </Card>
  )
}

export default SendTransaction

