import * as React from 'react';
import styled from 'styled-components';

interface ITransaction {
	id: string;
	type: number;
	amount: number;
	timestamp: number;
	principal: number;
}

interface ITransactionProps {
    transaction: ITransaction;
}

const Transaction: React.StatelessComponent<ITransactionProps> = ({transaction}): JSX.Element => {
	const { id, type, amount, timestamp, principal } = transaction;
	return (
		<TransactionBlock>
			<Span>{`tranaction id: ${id}`}</Span>
			<Span>{`tranaction type: ${type}`}</Span>
			<Span>{`principal: ${principal}`}</Span>
			<Span>{`tranaction amount: ${amount}`}</Span>
			<Span>{`timestamp: ${timestamp}`}</Span>
		</TransactionBlock>
	);
};

export default Transaction;

const Span = styled.span`
	display: block;
	font-weight: bold;
`;

const TransactionBlock = styled.div`
	margin: 5px 0;
	padding: 5px;
	border: solid 1px; #000;
`