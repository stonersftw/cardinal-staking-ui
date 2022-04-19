import { AccountData } from '@cardinal/common'
import { StakePoolData } from '@cardinal/staking/dist/cjs/programs/stakePool'
import { getAllStakePools } from '@cardinal/staking/dist/cjs/programs/stakePool/accounts'
import { useWallet } from '@solana/wallet-adapter-react'
import { StakePoolMetadata, stakePoolMetadatas } from 'api/mapping'
import { Header } from 'common/Header'
import { notify } from 'common/Notification'
import { pubKeyUrl, shortPubKey } from 'common/utils'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEnvironmentCtx } from 'providers/EnvironmentProvider'
import { useUserTokenData } from 'providers/TokenDataProvider'
import { useEffect, useState } from 'react'
import { FaQuestion } from 'react-icons/fa'

export function Placeholder() {
  return (
    <div className="h-[300px] animate-pulse rounded-lg bg-white bg-opacity-5 p-10"></div>
  )
}

export type StakePool = {
  stakePoolMetadata?: StakePoolMetadata
  stakePoolData: AccountData<StakePoolData>
}

function Home() {
  const { setAddress, address } = useUserTokenData()
  const { connection, environment } = useEnvironmentCtx()
  const wallet = useWallet()
  const [stakePools, setStakePools] = useState<[StakePool[], StakePool[]]>([
    [],
    [],
  ])
  const [stakePoolsLoaded, setStakePoolsLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (wallet && wallet.connected && wallet.publicKey) {
      setAddress(wallet.publicKey.toBase58())
    }
  }, [wallet.publicKey])

  useEffect(() => {
    const setData = async () => {
      try {
        const allStakePoolDatas = await getAllStakePools(connection)
        const [stakePoolsWithMetadata, stakePoolsWithoutMetadata] =
          allStakePoolDatas.reduce(
            (acc, stakePoolData) => {
              const stakePoolMetadata = stakePoolMetadatas.find(
                (md) => md.pubkey.toString() === stakePoolData.pubkey.toString()
              )
              if (stakePoolMetadata) {
                return [
                  [...acc[0], { stakePoolMetadata, stakePoolData }],
                  acc[1],
                ]
              }
              return [acc[0], [...acc[1], { stakePoolData }]]
            },
            [[] as StakePool[], [] as StakePool[]]
          )
        setStakePools([stakePoolsWithMetadata, stakePoolsWithoutMetadata])
      } catch (e) {
        notify({
          message: `${e}`,
          type: 'error',
        })
      } finally {
        setStakePoolsLoaded(true)
      }
    }
    setData().catch(console.error)
  }, [])

  return (
    <div>
      <Head>
        <title>Cardinal Staking UI</title>
        <meta name="description" content="Generated by Cardinal Staking UI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <div className="container mx-auto max-h-[90vh] w-full bg-[#1a1b20]">
          <Header />
          <div className="mt-10 mb-5 text-lg font-bold">Stake Pools</div>
          <div className="grid grid-cols-4 gap-5">
            {!stakePoolsLoaded ? (
              <>
                <Placeholder />
                <Placeholder />
                <Placeholder />
                <Placeholder />
                <Placeholder />
                <Placeholder />
              </>
            ) : stakePools[0].length > 0 ? (
              stakePools[0].map((stakePool) => (
                <div
                  className="h-[300px] cursor-pointer rounded-lg bg-white bg-opacity-5 p-10 transition-all duration-100 hover:scale-[1.01]"
                  onClick={() =>
                    router.push(
                      `/${
                        stakePool.stakePoolMetadata?.name ||
                        stakePool.stakePoolData.pubkey.toString()
                      }`
                    )
                  }
                >
                  <div className="text-center font-bold">
                    {stakePool.stakePoolMetadata?.displayName}
                  </div>
                  <div className="text-gray text-center">
                    <a
                      className="text-xs text-gray-500"
                      target="_blank"
                      rel="noreferrer"
                      href={pubKeyUrl(
                        stakePool.stakePoolData.pubkey,
                        environment.label
                      )}
                    >
                      {shortPubKey(stakePool.stakePoolData.pubkey)}
                    </a>
                  </div>
                  {stakePool.stakePoolMetadata?.imageUrl && (
                    <img
                      className="mx-auto mt-5 h-[150px] w-[150px] rounded-md"
                      src={stakePool.stakePoolMetadata.imageUrl}
                      alt={stakePool.stakePoolMetadata.name}
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="ml-2">No pools found...</div>
            )}
          </div>
          {stakePools[1].length > 0 && (
            <>
              <div className="mt-10 mb-5 text-lg font-bold">
                Unrecognized Pools
              </div>
              <div className="grid grid-cols-4 gap-5">
                {stakePools[1].map((stakePool) => (
                  <div
                    className="h-[300px] cursor-pointer rounded-lg bg-white bg-opacity-5 p-10 transition-all duration-100 hover:scale-[1.01]"
                    onClick={() =>
                      router.push(
                        `/${
                          stakePool.stakePoolMetadata?.name ||
                          stakePool.stakePoolData.pubkey.toString()
                        }`
                      )
                    }
                  >
                    <div className="text-center font-bold text-white">
                      <a
                        className="text-white"
                        target="_blank"
                        rel="noreferrer"
                        href={pubKeyUrl(
                          stakePool.stakePoolData.pubkey,
                          environment.label
                        )}
                      >
                        {shortPubKey(stakePool.stakePoolData.pubkey)}
                      </a>
                    </div>
                    <div className="text-gray text-center">
                      <a
                        className="text-xs text-gray-500"
                        target="_blank"
                        rel="noreferrer"
                        href={pubKeyUrl(
                          stakePool.stakePoolData.pubkey,
                          environment.label
                        )}
                      >
                        {shortPubKey(stakePool.stakePoolData.pubkey)}
                      </a>
                    </div>
                    <div className="flex justify-center align-middle">
                      <div className="mt-5 flex h-[150px] w-[150px] items-center justify-center rounded-full bg-white bg-opacity-5 text-5xl text-white text-opacity-40">
                        {/* {shortPubKey(stakePool.stakePoolData.pubkey)} */}
                        <FaQuestion />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
