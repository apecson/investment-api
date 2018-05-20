import axios from 'axios';
import * as React from 'react';
import styled from 'styled-components';
import CreateTransactionToolbar from '../CreateTransactionToolbar';
import Transaction from '../Transaction';

interface ILineProps {
	line: any;
	lineDeleted: (line: any) => void
}

export default class Line extends React.Component<ILineProps, any> {
	constructor(props) {
		super(props);
		this.state = {
			showTransactions: false,
			transactions: []
		}
	}
	public loadTransactions = () => {
		const { id } = this.props.line;
        axios.get(`http://localhost:4000/api/transactions/${id}`)
            .then(response => {
                if (response && response.statusText === 'OK') {
                    this.setState({
                        isLoading: false,
                        transactions: response.data || []
                    })
                }
            })
            .catch(error => new Error(error));
	}
	public toggleTransactions = () => {
		const { showTransactions, transactions } = this.state;
		if (!transactions.length) {
			this.loadTransactions();
		}
		this.setState({
			showTransactions: !showTransactions
		});
	}
	public transactionCreated = (transaction) => {
		const { transactions } = this.state;
		transactions.push(transaction);
		this.setState({transactions});
	}
	public deleteLine = () => {
		const { id } = this.props.line;
        axios.delete(`http://localhost:4000/api/lines/${id}`)
            .then(response => {
                if (response && response.statusText === 'OK') {
					this.props.lineDeleted(id);
                }
            })
            .catch(error => new Error(error));
	}
	public render(): JSX.Element {
		const { showTransactions, transactions } = this.state;
		const { apr, id, name, principal, timestamp } = this.props.line;
		return (
			<LineComponent>
				<Delete onClick={this.deleteLine}>delete</Delete>
				<Span>{`name: ${name}`}</Span>
				<Span>{`id: ${id}`}</Span>
				<Span>{`apr: ${apr}%`}</Span>
				<Span>{`principal: ${principal}`}</Span>
				<Span>{`creation time: ${timestamp}`}</Span>
				{showTransactions ? (
					<React.Fragment>
						{transactions.map(((t, i) => <Transaction key={i} transaction={t} />))}
						<CreateTransactionToolbar lineId={id} transactionCreated={this.transactionCreated} />
						<Toggler onClick={this.toggleTransactions}>hide transactions</Toggler>
					</React.Fragment>
				) : (
					<Toggler onClick={this.toggleTransactions}>show transactions</Toggler>
				)}
			</LineComponent>
		);
	}
};

const LineComponent = styled.div`
	border: solid 1px #000;
	margin-bottom: 5px;
	max-width: 470px;
	padding: 5px;
`;

const Span = styled.span`
	display: block;
	font-weight: bold;
`;

const Delete = Span.extend`
	width: 100%;
	text-align: right;
`;

const Toggler = styled.div`
	border-top: solid 1px; #000;
	margin-top: 8px;
	padding: 10px;
	text-align: center;
`
