import { Container } from '../container'
import { RealTimeMonitoring } from './real-time-monitoring'

export const DemoSection = () => {
  return (
    <Container className="max-w-5xl">
      <div>
        <p className="font-mono text-center">Monitor your messages as they are processed in real time</p>
      </div>

      <div className="border mt-14">
        <RealTimeMonitoring />
      </div>
    </Container>
  )
}
