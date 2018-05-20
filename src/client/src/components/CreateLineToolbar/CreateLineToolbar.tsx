import axios from 'axios';
import * as React from 'react';
import styled from 'styled-components';

interface ICreateLineProps {
    lineCreated: (line: any) => void;
}

export default class CreateLineToolbar extends React.Component<ICreateLineProps, any> {
    constructor(props) {
        super(props);
        this.state = {
            apr: '',
            name: '',
            principal: '',
            response: undefined
        }
    }
    public createLine = () => {
        const { apr, name, principal } = this.state;
        axios.post(`http://localhost:4000/api/lines`, {
            apr,
            name,
            principal
        }).then(response => {
            if (response && response.statusText === 'CREATED') {
                this.props.lineCreated(response.data)
                this.setState({
                    apr: '',
                    name: '',
                    principal: ''
                });
            }
        })
        .catch(error => new Error(error));
    }
    public updateApr = (event) => {
        this.setState({apr: event.target.value});
    }
    public updateName = (event) => {
        this.setState({name: event.target.value});
    }
    public updatePrincipal = (event) => {
        this.setState({principal: event.target.value});
    }
    public render(): JSX.Element {
        const { apr, name, principal } = this.state;
        return (
            <Toolbar>
                <Title>Create line of credit:</Title>
                    <Label>name:</Label>
                    <Input onChange={this.updateName} value={name} />
                    <Label>principal:</Label>
                    <Input onChange={this.updatePrincipal} value={principal} />
                    <Label>apr:</Label>
                    <Input onChange={this.updateApr} value={apr} />
                    <Button onClick={this.createLine}>create</Button>
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

const Input = styled.input`
	border: solid 1px #000;
`;

const Label = styled.label`
    display: block;
    font-weight: bold;
`

const Title = styled.h1`
    margin-bottom: 5px;
`;

const Toolbar = styled.div`
    margin: 5px 0;
`;
