import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { AiOutlineInstagram, AiOutlineTwitter } from "react-icons/ai";
import { CgWebsite } from "react-icons/cg";
import { HiDotsVertical } from "react-icons/hi";
import Header from "../../components/Header";
import NFTcard from "../../components/NFTcard";
import { client } from "../../lib/sanityClient";

const style = {
  bannerImageContainer: `h-[20vh] w-screen overflow-hidden flex justify-center items-center`,
  bannerImage: `w-full object-cover`,
  infoContainer: ` w-screen px-4`,
  midRow: ` w-full flex justify-center text-white`,
  endRow: ` w-full flex justify-end text-white pr-5`,
  profileImg: `w-40 h-40 object-cover rounded-full border-2 border-[#202225] mt-[-4rem]`,
  socialIconsContainer: `flex text-3xl mb-[1rem] lg:mb-[-2rem]`,
  socialIconsWrapper: `w-44`,
  socialIconsContent: `flex container justify-between text-[1.4rem] border-2 rounded-lg px-2`,
  socialIcon: `my-2`,
  divider: `border-r-2`,
  title: `text-3xl md:text-5xl font-bold mb-4`,
  createdBy: `text-lg mb-4`,
  statsContainer: ` mr-5 px-6 xl:px-10 w-full md:w-[44vw] flex justify-between py-4 border border-[#151b22] rounded-xl mb-4`,
  collectionStat: ` `,
  statValue: `text-3xl font-bold w-full flex items-center justify-center`,
  ethLogo: `h-6 mr-2`,
  statName: `text-lg w-full text-center mt-1`,
  description: `text-[#8a939b] text-xl w-max-1/4 flex-wrap mt-4`,
};
const Collection = () => {
  const router = useRouter();
  const { provider } = useWeb3();
  const { collectionId } = router.query;
  const [collection, setCollection] = useState({});
  const [nfts, setNfts] = useState([]);
  const [listings, setListings] = useState([]);
  const nftModule = useMemo(() => {
    if (!provider) return;

    const sdk = new ThirdwebSDK(
      provider.getSigner(),
      "https://eth-rinkeby.alchemyapi.io/v2/Q2sYOopSazndyGNy1QXP_etLlM3fH_cm"
    );
    return sdk.getNFTModule(collectionId);
  }, [provider]);

  //get all the NFTs in the collection
  useEffect(() => {
    if (!nftModule) return;
    (async () => {
      const nfts = await nftModule.getAll();
      setNfts(nfts);
    })();
  }, [nftModule]);

  const marketPlaceModule = useMemo(() => {
    if (!provider) return;
    const sdk = new ThirdwebSDK(
      provider.getSigner(),
      "https://eth-rinkeby.alchemyapi.io/v2/Q2sYOopSazndyGNy1QXP_etLlM3fH_cm"
    );
    return sdk.getMarketplaceModule(
      "0x8CF751D04E6f25B2C5792D67B3E63359f8D4a3d4"
    );
  }, [provider]);

  //get all listings in the collection

  useEffect(() => {
    if (!marketPlaceModule) return;
    (async () => {
      setListings(await marketPlaceModule.getAllListings());
    })();
  }, [marketPlaceModule]);
  //
  const fetchCollectionData = async (sanityClient = client) => {
    const query = `
  *[_type == "marketItems" && contractAddress == "${collectionId}"]{
  "imageUrl": profileImage.asset->url, 
  "bannerImageUrl": bannerImage.asset->url, 
  volumeTraded, 
  createdBy, 
  contractAddress,
  "creator": createBy->userName,
  title, floorPrice, 
  "allOwners": owners[]->, description
  }
  `;

    const collectionData = await sanityClient.fetch(query);

    console.log(collectionData, "😋");
    // the query returns i object inside of an array
    await setCollection(collectionData[0]);
  };
  useEffect(() => {
    fetchCollectionData();
  }, [collectionId]);
  return (
    <div className="overflow-hidden">
      <Header />
      <div className={style.bannerImageContainer}>
        <img
          className={style.bannerImage}
          src={
            collection?.bannerImageUrl
              ? collection.bannerImageUrl
              : "https://via.placeholder.com/200"
          }
          alt="banner"
        />
      </div>
      <div className={style.infoContainer}>
        <div className={style.midRow}>
          <img
            className={style.profileImg}
            src={
              collection?.imageUrl
                ? collection.imageUrl
                : "https://via.placeholder.com/200"
            }
            alt="profile image"
          />
        </div>
        <div className={style.endRow}>
          <div className={style.socialIconsContainer}>
            <div className={style.socialIconsWrapper}>
              <div className={style.socialIconsContent}>
                <div className={style.socialIcon}>
                  <CgWebsite />
                </div>
                <div className={style.divider} />
                <div className={style.socialIcon}>
                  <AiOutlineInstagram />
                </div>
                <div className={style.divider} />
                <div className={style.socialIcon}>
                  <AiOutlineTwitter />
                </div>
                <div className={style.divider} />
                <div className={style.socialIcon}>
                  <HiDotsVertical />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={style.midRow}>
          <div className={style.title}>{collection?.title}</div>
        </div>
        <div className={style.midRow}>
          <div className={style.createdBy}>
            Created by{" "}
            <span className="text-[#2081e2]">{collection?.creator}</span>
          </div>
        </div>
        <div className={style.midRow}>
          <div className={style.statsContainer}>
            <div className={style.collectionStat}>
              <div className={style.statValue}>{nfts.length}</div>
              <div className={style.statName}>items</div>
            </div>
            <div className={style.collectionStat}>
              <div className={style.statValue}>
                {collection?.allOwners ? collection.allOwners.length : ""}
              </div>
              <div className={style.statName}>owners</div>
            </div>
            <div className={style.collectionStat}>
              <div className={style.statValue}>
                <img
                  src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg"
                  alt="eth"
                  className={style.ethLogo}
                />
                {collection?.floorPrice}
              </div>
              <div className={style.statName}>floor price</div>
            </div>
            <div className={style.collectionStat}>
              <div className={style.statValue}>
                <img
                  src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg"
                  alt="eth"
                  className={style.ethLogo}
                />
                {collection?.volumeTraded}.5K
              </div>
              <div className={style.statName}>volume traded</div>
            </div>
          </div>
        </div>
        <div className={style.midRow}>
          <div className={style.description}>{collection?.description}</div>
        </div>
      </div>
      <div className=" flex flex-wrap ">
        {nfts.map((nftItem, id) => (
          <NFTcard
            key={id}
            nftItem={nftItem}
            title={collection?.title}
            listings={listings}
          />
        ))}
      </div>
    </div>
  );
};

export default Collection;
