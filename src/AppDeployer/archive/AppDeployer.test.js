import React from 'react';
import ReactDOM from 'react-dom';
import AppDeployer from './AppDeployer';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<AppDeployer />, div);
  ReactDOM.unmountComponentAtNode(div);
});
