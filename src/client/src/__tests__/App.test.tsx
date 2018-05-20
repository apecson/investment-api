import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { render } from 'react-testing-library'
import App from '../App';

describe('<App />', () => {
	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<App />, div);
		ReactDOM.unmountComponentAtNode(div);
	});

	it('renders create line of credit submit button', () => {
		const { queryAllByText } = render(<App />)
		const createButton = queryAllByText('create');
		expect(createButton).toBeDefined()
	});
});



