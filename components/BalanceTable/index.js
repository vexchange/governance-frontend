import React from "react";
import { formatDollarAmount, formatNumber } from "@utils/functions"
import AddressLink from '../AddressLink';

import { Wrapper } from './styled';
import tokenInfo from "@state/tokenInfo";

const BalanceTable = ({ balances }) => {
    const { tokens } = tokenInfo.useContainer();

    return (
    <Wrapper>
      <thead>
        <tr>
          <th>Address</th>
          <th>Name</th>
          <th align="right">Amount</th>
          <th align="right">USD Value</th>
        </tr>
      </thead>
      <tbody>
        {balances.map(({ balance, address, name }) => (
          <tr key={address}>
            <td type="addr">
              <AddressLink shorten address={address} />
            </td>
            <td>{name}</td>
            <td type="num" align="center">
                {formatNumber(balance)}
            </td>
            {tokens[address]? (
            <td type="num" align="right">
                {formatDollarAmount(balance * tokens[address].usdPrice)}
            </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </Wrapper>
  )
}

export default BalanceTable;
