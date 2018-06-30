import React, { Component } from 'react';
import axios from 'axios'
import titleCase from 'title-case'
import pascalCase from 'pascal-case'

import currentCoinLogo from './CurrentCoinLogo.svg'
import 'font-awesome/css/font-awesome.css'
import './AppDeployer.css';

import calculateServiceAddress from './calculateServiceAddress'

import ParameterCell from './ParameterCell'
import ServicePreviewCell from './ServicePreviewCell'
import Progress from './Progress'
// import DeployOptions from './DeployOptions'

const context = require.context('../templates', true, /interface.json$/)
const serviceDefaults = {}
const serviceInterfaces = {}

context.keys().forEach(filePath => {
  const fileName = filePath.split('/')[1]
  const serviceName = pascalCase(fileName.split('-').slice(0, -1).join(' '))
  const serviceInfo = context(filePath)

  const defaults = Object.entries(serviceInfo).reduce((accumulator, [param, info]) => {
    accumulator[param] = info.default

    return accumulator
  }, {})

  serviceInterfaces[serviceName] = serviceInfo
  serviceDefaults[serviceName] = defaults
})

const demoDeployTime = 1

class AppDeployer extends Component {

  state = {
    selectedServiceName: 'BrandPage',
    balance: 100,
    feedback: null,
    progress: {},
    ...serviceDefaults
  }

  componentDidMount() {
    this.load.call(this)
  }

  ServiceLinkCell = ({ serviceName }) => (
    <div
      className={`service-cell${
        this.state.selectedServiceName === serviceName
          ? ' selected-service-cell'
          : ''
        }`}
      onMouseEnter={event => {
        this.setState({
          selectedServiceName: serviceName
        })
      }}
      onKeyPress={event => {
        if (event.key === ' ') {
          this.setState({
            selectedServiceName: serviceName
          })
        }
      }}
    >
      {titleCase(serviceName)}
    </div>
  )

  ParamsCustomize = () => {
    const serviceInfo = serviceInterfaces[this.state.selectedServiceName] || {}
    const paramValues = this.state[this.state.selectedServiceName]

    return (
      <div className='AppDeployer-params'>
        <div className='th customize-header'>
          Customize
        </div>
        {
          Object.keys(
            serviceInfo
          ).map(paramName => (
            <ParameterCell
              key={paramName}
              paramName={paramName}
              paramInfo={serviceInfo[paramName]}
              value={paramValues[paramName]}
              onValueChange={newValue => {
                const serviceName = this.state.selectedServiceName

                const newParams = Object.assign(
                  {},
                  this.state[serviceName],
                  {
                    [paramName]: newValue
                  }
                )

                this.setState({
                  [serviceName]: newParams
                })

                localStorage[serviceName] = JSON.stringify(newParams)
              }}
            />
          ))
        }
      </div>
    )
  }

  ServicesColumn = () => {
    return (
      <div className='column AppDeployer-services-column'>
        {
          Object.keys(serviceInterfaces)
            .map(serviceName => (
              <this.ServiceLinkCell
                key={serviceName}
                serviceName={serviceName}
              />
            ))
        }
      </div>
    )
  }

  saveToLocal = () => {
    const serviceName = this.state.selectedServiceName

    if (!serviceName) return

    const serviceOptions = this.state[serviceName]

    localStorage[serviceName] = JSON.stringify(serviceOptions)
  }

  load = () => {
    // loads saved services and balance from local storage
    Object.keys(this.state).forEach(serviceName => {
      // if (serviceName === 'selectedServiceName') return

      if (localStorage[serviceName]) {
        this.setState({
          [serviceName]: JSON.parse(localStorage[serviceName])
        })
      }
    })

    if (parseInt(localStorage.version, 10) !== 13) {
      localStorage.balance = 100
      this.setState({ balance: 100 })
      localStorage.version = 13
    }
  }

  confirmDeploy = () => {
    if (!this.state.selectedServiceName) {
      this.setState({
        feedback: 'You must select a service to deploy'
      })
      return
    }

    this.setState({
      feedback: <div className='column'>
        <div>
          Would you like to deploy
          <div className='field'>{this.state.selectedServiceName}</div>
          for
          <div className='field'>{demoDeployTime} days</div>
          at a cost of
          <div className='field'>{demoDeployTime} CUR(demo)</div>
          ?
        </div>
        <div className='buttons'>
          <div
            className='deploy-button yes-no-button'
            onClick={this.demoDeploy}
          >
            Yes
          </div>
          <div
            className='deploy-button yes-no-button'
            onClick={() => this.setState({ feedback: null })}
          >
            No
          </div>
        </div>
      </div>
    })
  }

  demoDeploy = () => {
    const serviceName = this.state.selectedServiceName
    const serviceOptions = this.state[serviceName]

    // this is the one and only time that the service address is calculated
    const serviceAddress = calculateServiceAddress({
      serviceName,
      serviceOptions,
      timestamp: Date.now()
    })

    this.decreaseBalance(demoDeployTime)

    this.setState({
      feedback: <div className='column'>
        In 1 or 2 minutes your service will be
        available here: <a
          className='service-link'
          target='_blank'
          href={`http://${serviceAddress}.s3-website.us-east-2.amazonaws.com`}
        >
          {`http://${serviceAddress}.s3-website.us-east-2.amazonaws.com`}
        </a>
      </div>,
      progress: Object.assign({}, this.state.progress, {
        [serviceAddress]: {
          state: 'transferring'
        }
      })
    })

    return axios.post(
      `/deploy`,
      {
        serviceName,
        serviceOptions,
        serviceAddress,
      },
      {
        headers: {
          'Content-type': 'Application/json',
          'Accept': 'Application/json',
        },
        timeout: 300000 // 5 min
      }
    )
      .then(response => {
        // console.log('Response from server after trying to save:', response)
        this.setState({
          progress: Object.assign({}, this.state.progress, {
            [serviceAddress]: {
              state: 'deploying',
              txHash: response.data
            }
          })
        })

        return this.checkIfDeployed(serviceAddress)
      })
      .catch(error => {
        console.error('Problem saving or transferring or deploying')
        console.error(error)

        const errorMessage = error.message.slice(0, 7) === 'timeout'
          ? 'The token transfer is taking longer than expected.'
          : undefined

        this.setState({
          progress: Object.assign({}, this.state.progress, {
            [serviceAddress]: {
              state: 'error',
              errorMessage,
              serviceUrl: `http://${serviceAddress}.s3-website.us-east-2.amazonaws.com`
            }
          })
        })
      })
  }

  checkIfDeployed(serviceAddress) {
    return axios.get(`/checkservice/${serviceAddress}`)
      .then(response => {
        if (response.status === 201 || response.status === 200) {

          // wait an extra 2 seconds because it seems that the aws server has
          // access to the deployed service before us
          setTimeout(() => {
            const { txHash } = this.state.progress[serviceAddress]

            this.setState({
              progress: Object.assign({}, this.state.progress, {
                [serviceAddress]: {
                  state: 'done',
                  txHash: txHash,
                  serviceUrl: `http://${serviceAddress}.s3-website.us-east-2.amazonaws.com`
                }
              })
            })
          }, 3000)

        } else {
          setTimeout(() => this.checkIfDeployed(serviceAddress), 5000)
        }
      })
      .catch(response => {
        setTimeout(() => this.checkIfDeployed(serviceAddress), 5000)
      })
  }

  decreaseBalance(amount) {
    const { balance } = this.state
    const newBalance = balance - amount
    this.setState({ balance: newBalance })
    localStorage['balance'] = newBalance
  }

  render = () => {
    return (
      <div className='AppDeployer'>
        {
          this.state.feedback
            ? (
              <div className='deploy-feedback'>
                <i className='fa fa-times close-feedback' onClick={() => this.setState({
                  feedback: null
                })}
                />
                <div>{this.state.feedback}</div>
              </div>
            )
            : null
        }

        <div className="page-container">
          <div className="left-column">
            <div className="logo">
              <img id='currentcoin-logo' src={currentCoinLogo} alt="CurrentCoin" />
              Current<span className="logo-color">Coin</span> Create
            </div>
            <div className='th' id="template-header">
              Templates
            </div>
            <div id="select-template"><this.ServicesColumn /></div>
          </div>

          <div className='middle' id="services-container">
            <div id="preview-template">
              <ServicePreviewCell
                serviceName={this.state.selectedServiceName}
                serviceOptions={this.state[this.state.selectedServiceName]}
              />
            </div>

            <div className='customize'>
              <this.ParamsCustomize />
              <div className='balance'>Your [demo] balance is {this.state.balance} CUR.</div>
              <div className='deploy-button' onClick={this.confirmDeploy}>Deploy Service</div>
            </div>
          </div>
        </div>
        <Progress tasks={this.state.progress} />
      </div>
    );
  }
}

export default AppDeployer;
