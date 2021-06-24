import React, {useState} from "react"
import * as fcl from "@onflow/fcl"
import styled from 'styled-components'

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
  import FungibleToken from 0x4fc019cea9fc4817
  import NonFungibleToken from 0x4fc019cea9fc4817
  import Kibble from 0x4fc019cea9fc4817
  import KittyItems from 0x4fc019cea9fc4817
  import KittyItemsMarket from 0x4fc019cea9fc4817

  pub fun hasKibble(_ address: Address): Bool {
    let receiver = getAccount(address)
      .getCapability<&Kibble.Vault{FungibleToken.Receiver}>(Kibble.ReceiverPublicPath)
      .check()

    let balance = getAccount(address)
      .getCapability<&Kibble.Vault{FungibleToken.Balance}>(Kibble.BalancePublicPath)
      .check()

    return receiver && balance
  }

  pub fun hasItems(_ address: Address): Bool {
    return getAccount(address)
      .getCapability<&KittyItems.Collection{NonFungibleToken.CollectionPublic, KittyItems.KittyItemsCollectionPublic}>(KittyItems.CollectionPublicPath)
      .check()
  }

  pub fun hasMarket(_ address: Address): Bool {
    return getAccount(address)
      .getCapability<&KittyItemsMarket.Collection{KittyItemsMarket.CollectionPublic}>(KittyItemsMarket.CollectionPublicPath)
      .check()
  }

  transaction {
    prepare(acct: AuthAccount) {
      if !hasKibble(acct.address) {
        if acct.borrow<&Kibble.Vault>(from: Kibble.VaultStoragePath) == nil {
          acct.save(<-Kibble.createEmptyVault(), to: Kibble.VaultStoragePath)
        }
        acct.unlink(Kibble.ReceiverPublicPath)
        acct.unlink(Kibble.BalancePublicPath)
        acct.link<&Kibble.Vault{FungibleToken.Receiver}>(Kibble.ReceiverPublicPath, target: Kibble.VaultStoragePath)
        acct.link<&Kibble.Vault{FungibleToken.Balance}>(Kibble.BalancePublicPath, target: Kibble.VaultStoragePath)
      }

      if !hasItems(acct.address) {
        if acct.borrow<&KittyItems.Collection>(from: KittyItems.CollectionStoragePath) == nil {
          acct.save(<-KittyItems.createEmptyCollection(), to: KittyItems.CollectionStoragePath)
        }
        acct.unlink(KittyItems.CollectionPublicPath)
        acct.link<&KittyItems.Collection{NonFungibleToken.CollectionPublic, KittyItems.KittyItemsCollectionPublic}>(KittyItems.CollectionPublicPath, target: KittyItems.CollectionStoragePath)
      }

      if !hasMarket(acct.address) {
        if acct.borrow<&KittyItemsMarket.Collection>(from: KittyItemsMarket.CollectionStoragePath) == nil {
          acct.save(<-KittyItemsMarket.createEmptyCollection(), to: KittyItemsMarket.CollectionStoragePath)
        }
        acct.unlink(KittyItemsMarket.CollectionPublicPath)
        acct.link<&KittyItemsMarket.Collection{KittyItemsMarket.CollectionPublic}>(KittyItemsMarket.CollectionPublicPath, target:KittyItemsMarket.CollectionStoragePath)
      }
    }
  }
`

const SetupAccount = () => {
  const [status, setStatus] = useState("Not started")
  const [transaction, setTransaction] = useState(null)

  const SetupAccount = async (event) => {
    event.preventDefault()
    
    setStatus("Resolving...")

    const blockResponse = await fcl.send([
      fcl.getLatestBlock(),
    ])

    const block = await fcl.decode(blockResponse)
    
    try {
      const tx = await fcl.send([
        fcl.transaction(simpleTransaction),
        fcl.proposer(fcl.currentUser().authorization),
        fcl.payer(fcl.currentUser().authorization),
        fcl.limit(100),
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
      <Header>SetupAccount</Header>
      <Code>{simpleTransaction}</Code>

      <button onClick={SetupAccount}>
        Setup
      </button>

      <Code>Status: {status}</Code>

      {transaction && <Code>{JSON.stringify(transaction, null, 2)}</Code>}
    </Card>
  )
}

export default SetupAccount
