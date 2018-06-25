import { sha3_256 } from 'js-sha3'

export default ({
  serviceName,
  serviceOptions,
  timestamp,
}) => {
  if (!serviceName)
    serviceName = ''

  const serviceOptionsString =
    typeof serviceOptions === 'string'
      ? serviceOptions
      : JSON.stringify(serviceOptions)

  return '0x' + sha3_256(
    serviceName.concat(serviceOptionsString).concat(timestamp)
  )
  .slice(0, 40)
}
