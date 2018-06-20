import React, { Component } from 'react';
import QR from './QR'

export default class Address extends Component {
  state = {
    expanded: false
  }

  render() {
    const { address } = this.props
    return (
      <div className={
        this.state.expanded
          ? 'address address--expanded'
          : 'address'
      }>
        {address}
        {
          this.state.expanded
            ? <QR
                data={address}
                onClick={() => this.setState({ expanded: false })}
              />
            : <i
                className='fa fa-qrcode qr-icon'
                onClick={() => this.setState({ expanded: true })}
              />
        }
      </div>
    )
  }
}
