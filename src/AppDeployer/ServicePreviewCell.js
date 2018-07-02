import React, { Component } from 'react';
import pascalCase from 'pascal-case'

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
        <div className='th preview-header'>
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
          {Preview ? <Preview {...serviceOptions} /> : null}
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
