import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import {tx} from "./tx"

const CODE = fcl.cdc`
    import NonFungibleToken from 0x4fc019cea9fc4817
    import KittyItems from 0x4fc019cea9fc4817

    // This transction uses the NFTMinter resource to mint a new NFT.
    //
    // It must be run with the account that has the minter resource
    // stored at path /storage/NFTMinter.

    transaction(recipient: Address, typeID: UInt64) {
        
        // local variable for storing the minter reference
        let minter: &KittyItems.NFTMinter

        prepare(signer: AuthAccount) {

            // borrow a reference to the NFTMinter resource in storage
            self.minter = signer.borrow<&KittyItems.NFTMinter>(from: KittyItems.MinterStoragePath)
                ?? panic("Could not borrow a reference to the NFT minter")
        }

        execute {
            // get the public account object for the recipient
            let recipient = getAccount(recipient)

            // borrow the recipient's public NFT collection reference
            let receiver = recipient
                .getCapability(KittyItems.CollectionPublicPath)!
                .borrow<&{NonFungibleToken.CollectionPublic}>()
                ?? panic("Could not get receiver reference to the NFT Collection")

            // mint the NFT and deposit it to the recipient's collection
            self.minter.mintNFT(recipient: receiver, typeID: typeID)
        }
    }

`

export default function MintNft({recipient, typeID}, opts = {}) {
  if (recipient == null)
    throw new Error("MintNft(recipient, typeID) -- recipient required")
  if (typeID == null)
    throw new Error("MintNft(itemID, typeID) -- typeID required")

  // prettier-ignore
  return (tx([
    fcl.transaction(CODE),
    fcl.args([
      fcl.arg((String)(recipient), t.Address),
      fcl.arg(Number(typeID), t.UInt64),
    ]),
    fcl.proposer(fcl.authz),
    fcl.payer(fcl.authz),
    fcl.authorizations([
      fcl.authz
    ]),
    fcl.limit(1000)
  ], opts))
  
}