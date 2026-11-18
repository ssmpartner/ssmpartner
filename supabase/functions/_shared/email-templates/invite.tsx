/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Deine Einladung zu {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Du bist eingeladen</Heading>
        <Text style={text}>
          Deine Einladung zu{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . Nimm die Einladung über den folgenden Button an und erstelle dein Konto.
        </Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Einladung annehmen
        </Button>
        <Text style={footer}>
          Wenn du diese Einladung nicht erwartet hast, kannst du diese E-Mail ignorieren.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: '"Neue Alte Grotesk", Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 600 as const,
  color: 'hsl(0, 0%, 12%)',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: 'hsl(0, 0%, 45%)',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const link = { color: 'inherit', textDecoration: 'underline' }
const button = {
  backgroundColor: 'hsl(168, 17%, 23%)',
  color: 'hsl(60, 10%, 95%)',
  fontSize: '14px',
  border: '1px solid hsl(168, 17%, 23%)',
  borderRadius: '12px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: 'hsl(0, 0%, 45%)', margin: '30px 0 0' }
// Rendered as a text child, which React may HTML-escape: keep this CSS free of >, &, and quotes.
const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .dm-btn { background-color: hsl(168, 17%, 23%) !important; color: hsl(60, 10%, 95%) !important; }
  }
  [data-ogsc] .dm-btn { background-color: hsl(168, 17%, 23%) !important; color: hsl(60, 10%, 95%) !important; }
  [data-ogsb] .dm-btn { background-color: hsl(168, 17%, 23%) !important; color: hsl(60, 10%, 95%) !important; }
`
