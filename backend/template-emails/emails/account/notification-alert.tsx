import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';

import { Card } from '../../components/Card';
import { Footer } from '../../components/Footer';

interface NotificationAlertEmailProps {
    name: string;
    title: string;
    message: string;
    type: string;
    notificationDate: string;
    actionUrl: string;
}

export const NotificationAlertEmail = ({
    name,
    title,
    message,
    type,
    notificationDate,
    actionUrl,
}: NotificationAlertEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Vous avez une notification non lue sur CashFlow Positif</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Card>
                        <Heading style={h1}>Notification non lue</Heading>
                        <Text style={paragraph}>Bonjour {name},</Text>
                        <Text style={paragraph}>
                            Vous avez une notification non lue depuis plus de 30 minutes sur votre
                            compte CashFlow Positif.
                        </Text>

                        <Section style={notificationCard}>
                            <Heading as="h3" style={h3}>
                                {title}
                            </Heading>
                            <Text style={messageText}>{message}</Text>
                            <Text style={typeText}>Type: {type}</Text>
                            <Text style={dateText}>Date: {notificationDate}</Text>
                        </Section>

                        <Section style={btnContainer}>
                            <Button style={button} href={actionUrl}>
                                Voir la notification
                            </Button>
                        </Section>

                        <Hr style={hr} />

                        <Text style={paragraph}>
                            Si vous avez des questions, n'hésitez pas à nous contacter.
                        </Text>

                        <Footer />
                    </Card>
                </Container>
            </Body>
        </Html>
    );
};

export default NotificationAlertEmail;

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
};

const h1 = {
    color: '#333',
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '40px 0',
    padding: '0',
};

const h3 = {
    color: '#333',
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0',
    padding: '0',
};

const notificationCard = {
    backgroundColor: '#f9f9f9',
    borderLeft: '4px solid #0070f3',
    borderRadius: '4px',
    padding: '16px',
    marginBottom: '20px',
};

const messageText = {
    fontSize: '16px',
    lineHeight: '24px',
    margin: '10px 0',
};

const typeText = {
    fontSize: '14px',
    color: '#666',
    margin: '5px 0',
};

const dateText = {
    fontSize: '14px',
    color: '#666',
    margin: '5px 0',
};

const btnContainer = {
    textAlign: 'center' as const,
};

const button = {
    backgroundColor: '#0070f3',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};
