import { ethers } from "ethers"
import type { NextPage } from 'next'
import Image from "next/image"
import { useEffect, useState } from "react"
import { useAccount, useContractReads } from "wagmi"
import Controls from "../components/Controls"
import EntryList from "../components/EntryList"
import Footer from "../components/Footer"
import Header from "../components/Header"
import Winner from "../components/Winner"
import { rafflebotContract } from "../lib/contract"

import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)
dayjs.extend(duration)

const Home: NextPage = () => {
  const [address, setAddress] = useState()
  const [raffleID, setRaffleID] = useState()
  const [countdown, setCountdown] = useState(0)

  /**
   * Contract hooks
   */
  useAccount({
    onConnect({address}) {
      if (address) {
        setAddress(address)
      }
    }
  })

  useContractReads({
    contracts: [
      {
        ...rafflebotContract,
        functionName: "getID",
      },
      {
        ...rafflebotContract,
        functionName: "getEndTime",
      }
    ],
    onSuccess(data) {
      if (data[0]) {
        setRaffleID(ethers.utils.formatUnits(data[0], 0))
      }
      if (data[1]) {
        const end = dayjs(data[1] * 1000)
        const countdown = end.diff(dayjs())
        setCountdown(countdown)
      }
    }
  })

  /**
   * On page load, begin a countdown timer for the raffle
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(countdown - 1000)
    }, 1000)
    return () => clearInterval(interval)
  }, [countdown])

  return (
    <div className="bg-gradient-to-br from-red-500 to-fuchsia-900 min-h-screen flex flex-col justify-between">
      <Header />
      <div className="flex m-auto w-3/5 bg-white/25 rounded-xl border-2 border-white/50 p-3">
        <div className="flex flex-col w-1/2">
          <time className="text-gray-200">
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="text-5xl font-semibold mt-2">Raffle #{raffleID}</h1>
          <p className="mt-4">Welcome to rafflebot, where every day we raffle prizes away to one lucky <em>human</em>.  To enter today's raffle, prove you are human below using your <a className="font-semibold underline" href="https://worldcoin.org">WorldID</a>!</p>
          <div className="h-8" />
          <p>Today's raffle ends in:</p>
          <h2 className="mt-8 text-center text-5xl font-bold">
            {countdown && 
              <time className="whitespace-pre">{dayjs.duration(countdown).hours() + "h  " + dayjs.duration(countdown).minutes() + "m  " + dayjs.duration(countdown).seconds() + "s"}</time>
            }
          </h2>
          <Controls address={address} />
        </div>
        <div className="w-1/2">
          <div className="border-2 border-white/50 rounded-full m-auto flex justify-center w-fit p-4">
            <Image
              src="/poap.svg"
              alt={"The current prize for raffle #" + raffleID}
              width={250}
              height={250}
            />
          </div>
          <Winner raffleID={raffleID} />
          <EntryList />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Home
