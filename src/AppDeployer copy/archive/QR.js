import React, { Component } from 'react';
import qr from 'qr.js'

export default class QR extends Component {
  componentDidMount() {
    const { canvas } = this
    const { data } = this.props

    if (!data || !canvas) return
    const size = 250
    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')
    const cells = qr(data).modules

    var tileW = canvas.width  / cells.length;
    var tileH = canvas.height / cells.length;

    cells.forEach((row, r) => {
      row.forEach((cell, c) => {
        ctx.fillStyle = cell ? '#000' : '#FFF'
        var w = (Math.ceil((c+1)*tileW) - Math.floor(c*tileW));
        var h = (Math.ceil((r+1)*tileH) - Math.floor(r*tileH));
        ctx.fillRect(Math.round(c*tileW), Math.round(r*tileH), w, h);
      })
    })
  }

  render() {
    if (!this.props.data) return null

    return (
      <canvas
        className='qr'
        ref={canvas => this.canvas = canvas}
        onClick={this.props.onClick}
      />
    )
  }
}
