import React, { Component } from 'react';
import pascalCase from 'pascal-case'

import ParameterCell from './ParameterCell'

const context = require.context('../templates', true, /\/.+\/index.js$/)
const servicePreviews = {}

context.keys().forEach(function (filePath) {
  const fileName = filePath.split('/')[1]
  const serviceName = pascalCase(fileName.split('-').slice(0, -1).join(' '))

  servicePreviews[serviceName] = context(filePath).default
})

export default class ServicePreviewCell extends Component {
  state = {
    fullscreen: false,
  }

  render() {
    const { serviceName, serviceOptions } = this.props
    if (!serviceName) return null

    const Preview = servicePreviews[serviceName]

    return (
      <div className='AppDeployer-service-preview-column'>
        <div className='th'>
          Preview
        </div>
        <div
          className={
            'td' + ( this.state.fullscreen
              ? ' AppDeployer-service-preview--expanded'
              : ' AppDeployer-service-preview'
            )
          }
        >
          {
            Preview
              ? <Preview
                  {...serviceOptions}
                  ref={ref => {
                    const nodes = document.getElementsByClassName('adjust-title')
                    Array.from(nodes).forEach(node => {
                      node.addEventListener('mouseenter', () => {
                        console.log('hello')
                        const rect = node.getBoundingClientRect()
                        console.log('rect:', rect)
                      })
                    })
                  }}
                />
              : null
          }
          <ParameterCell
            style={{
              position: 'absolute',
              top: '200',
              left: '200',
            }}
            paramInfo={{
              type: 'boolean'
            }}
            value={false}
            paramName='test'
            onValueChange={console.log}
          />
          <div
            className='expand'
            onClick={() => this.setState({
              fullscreen: !this.state.fullscreen
            })}
            onKeyPress={event => {
              if (event.key === ' ') {
                this.setState({
                  fullscreen: !this.state.fullscreen
                })
              }
            }}
            tabIndex='0'
          >
            <i className={
              this.state.fullscreen
                ? 'fa fa-compress'
                : 'fa fa-expand' // fa-arrows-alt
              }
            />
          </div>
        </div>
      </div>
    )
  }
}
