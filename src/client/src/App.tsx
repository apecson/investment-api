import axios from 'axios';
import * as React from 'react';
import styled from 'styled-components';
import CreateLineToolbar from './components/CreateLineToolbar';
import Line from './components/Line';

const ApplicationContainer = styled.div`
	padding: 15px;
`;

class App extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			lines: []
		}
	}

    public componentDidMount() {
        axios.get(`http://localhost:5000/api/lines`)
            .then(response => {
                if (response && response.statusText === 'OK') {
                    this.setState({
                        isLoading: false,
                        lines: response.data
                    })
                }
            })
            .catch(error => new Error(error));
	}

	public lineCreated = (line) => {
		this.state.lines.push(line);
		this.setState({lines: this.state.lines});
	}

	public render(): JSX.Element {
		return (
			<ApplicationContainer>
				<h1>Lines of credit:</h1>
				{this.state.lines.map((l, i) => <Line key={i} line={l} />)}
				<CreateLineToolbar lineCreated={this.lineCreated} />
			</ApplicationContainer>
		);
	}
}

export default App;
