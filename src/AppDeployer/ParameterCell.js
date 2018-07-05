import React, { Component } from 'react';
import titleCase from 'title-case'

export default class ParameterCell extends Component {
  constructor(props) {
    super(props)

    this.state = {
      editing: false,
    }
  }

  render() {
    const { paramInfo, paramName, value, onValueChange } = this.props

    const inputType = paramInfo.type === 'number'
      ? 'number'
      : paramInfo.type === 'boolean'
        ? 'checkBox'
        : paramInfo.type === 'range'
          ? 'range'
          : paramInfo.type === 'enum'
            ? 'radio'
            : 'text'

    return (
      <div
        className={`td parameter-cell${
          this.state.editing
            ? ' selected-cell'
            : ''
          }`}
        onMouseEnter={event => {
          this.setState({
            editing: true
          })
        }}
        onMouseLeave={() => this.setState({
          editing: false
        })}
        // onKeyPress={event => {
        //   if (event.key === ' ') {
        //     this.setState({
        //       editing: true
        //     })
        //   }
        // }}
        // onFocus={() => this.setState({
        //   editing: true
        // })}
        // onBlur={() => this.setState({
        //   editing: false
        // })}
        // tabIndex='0'
      >
        {
          !this.state.editing
            ? titleCase(paramName)
            : paramInfo.type !== 'enum'
              ? (
                <input
                  className={
                    'input'
                      + (
                        inputType === 'text' || inputType === 'range'
                        ? ' full-width'
                        : ''
                      )
                  }
                  value={value}
                  checked={value}
                  type={inputType}
                  min={paramInfo.min}
                  max={paramInfo.max}
                  onChange={event => {
                    if (inputType === 'checkBox')
                      onValueChange(event.target.checked)
                    else
                      onValueChange(event.target.value)
                  }}
                  ref={inputNode => {
                    if (inputNode) {
                      inputNode.focus()
                    }
                  }}
                />
              )
              : (
                paramInfo.values.map(possibleValue => (
                  <input
                    className='input'
                    key={possibleValue}
                    type={inputType}
                    checked={possibleValue === value}
                    onChange={event => {
                      onValueChange(possibleValue)
                    }}
                    ref={inputNode => {
                      if (inputNode && possibleValue === value) {
                        inputNode.focus()
                      }
                    }}
                  />
                ))
              )
          }
      </div>
    )
  }
}
