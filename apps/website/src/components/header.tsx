import { Container } from './container'
import { Button } from './ui/button'

export const Header = () => {
  return (
    <header>
      <Container className="flex justify-between items-center p-4">
        <h1 className="font-mono">Postilion</h1>

        <Button asChild>
          <a href="https://app.postilion.ai">Get started</a>
        </Button>
      </Container>
    </header>
  )
}
