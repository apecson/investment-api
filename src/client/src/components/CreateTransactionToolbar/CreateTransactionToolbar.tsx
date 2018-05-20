import axios from 'axios';
import * as React from 'react';
import styled from 'styled-components';

interface ICreateTransactionToolbar {
    lineId: any;
    transactionCreated: (line: any) => void;
}

export default class CreateTransactionToolbar extends React.Component<ICreateTransactionToolbar, any> {
    constructor(props) {
        super(props);
        this.state = {
            amount: '',
            type: 0,
        }
    }
    public createTransaction = () => {
        const { lineId } = this.props;
        const { amount, type } = this.state;
        axios.post(`http://localhost:4000/api/transactions/`, { amount, lineId, type})
            .then(response => {
                if (response && response.statusText === 'CREATED') {
                    this.props.transactionCreated(response.data)
                    this.setState({
                        amount: '',
                        type: 0
                    });
                }
            })
            .catch(error => new Error(error));
    }
    public updateAmount = (event) => {
        this.setState({amount: event.target.value});
    }
    public updateType = (event) => {
        this.setState({type: event.target.value});
    }
    public render(): JSX.Element {
        const { amount, type } = this.state;
        return (
            <Toolbar>
                <Title>Make transaction:</Title>
                    <Label>amount:</Label>
                    <Input onChange={this.updateAmount} value={amount} />
                    <Label>type:</Label>
                    <Select onChange={this.updateType} value={type}>
                        <option value='0'>pay</option>
                        <option value='1'>widthdraw</option>
                    </Select>
                    <Button onClick={this.createTransaction}>process</Button>
            </Toolbar>
        );
    }
}

const Button = styled.button`
    border: solid 1px #000;
    display: block;
    margin-top: 5px;
    font-size: 16px;
    font-weight: bold;
    padding: 5px;
    background: black;
    color: white;
`;

const Select = styled.select`
    display: block;
    font-weight: bold;
`

const Input = styled.input`
	border: solid 1px #000;
`;

const Label = styled.label`
    display: block;
    font-weight: bold;
`;

const Title = styled.h3`
    margin-bottom: 5px;
`;

const Toolbar = styled.div`
    margin: 5px 0;
`;
