import { utils } from 'ethers'
import currency from 'currency.js'
import numeral from 'numeral'
import { VEX_NETWORK_NAME } from "@utils/constants";
import dayjs from 'dayjs';

const { commify, formatEther } = utils

export const getDefaultSignificantDecimalsFromAssetDecimals = decimals => {
  switch (decimals) {
    case 18:
      return 6
    case 8:
      return 5
    case 6:
    default:
      return 2
  }
}

export const userAccount = {
  get: (account) => {
    const savedAccount = localStorage.getItem(`governance-wallet-${VEX_NETWORK_NAME}`);
    return savedAccount ?? account;
  },
  set: (account) => {
    localStorage.setItem(`governance-wallet-${VEX_NETWORK_NAME}`, account);
  },
  remove: () => {
    localStorage.removeItem(`governance-wallet-${VEX_NETWORK_NAME}`);
    window.location.href = "/";
  },
};

export const getProposalEndDate = (timestamp, startBlock, endBlock) => {
  const startDate = dayjs.unix(timestamp)
  const blocksInBetween = endBlock - startBlock
  const numberOfSeconds = blocksInBetween * 10

  return startDate.add(numberOfSeconds, 'seconds').unix()
}

export const copyTextToClipboard = text => {
  const textField = document.createElement('textarea')
  textField.innerText = text
  document.body.appendChild(textField)
  if (window.navigator.platform === 'iPhone') {
    textField.setSelectionRange(0, 99999)
  } else {
    textField.select()
  }
  document.execCommand('copy')
  textField.remove()
}

export const formatBigNumber = num => {
  const remainder = num.mod(1e14)
  return commify(formatEther(num.sub(remainder)))
}

export const truncateAddress = address => `${address.slice(0, 6)}...${address.slice(address.length - 4)}`

export const formatAmount = n => {
  if (n < 1e4) return `${currency(n, { separator: ',', symbol: '' }).format()}`
  if (n >= 1e4 && n < 1e6) return `${parseFloat((n / 1e3).toFixed(2))}K`
  if (n >= 1e6 && n < 1e9) return `${parseFloat((n / 1e6).toFixed(2))}M`
  if (n >= 1e9 && n < 1e12) return `${parseFloat((n / 1e9).toFixed(2))}B`
  if (n >= 1e12) return `${parseFloat((n / 1e12).toFixed(2))}T`

  return ''
}

export const formatCurrency = n => numeral(n).format('$0,0.00')
