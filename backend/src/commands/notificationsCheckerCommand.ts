import { Notification } from '@/config/client';
import { notificationRepository } from '@/repositories/notificationRepository';
import { userRepository } from '@/repositories/userRepository';
import { mailerService } from '@/services';
import { logger } from '@/utils/logger';
import { render } from '@react-email/components';
import { RestrictedUserDto } from '@shared/dto';
import { NotificationAlertEmail } from '@template-emails/emails/account/notification-alert';

const notificationLogger = logger.child({ module: '[NotificationsChecker]' });

export const main = async () => {
    notificationLogger.info('Starting notifications checker command');

    try {
        // Find unread notifications older than 30 minutes
        const unreadNotifications = await notificationRepository.findUnreadNotificationsOlderThan(30);

        if (unreadNotifications.length === 0) {
            notificationLogger.debug('No unread notifications older than 30 minutes found');
            return;
        }

        notificationLogger.info(`Found ${unreadNotifications.length} unread notifications older than 30 minutes`);

        let successCount = 0;
        let errorCount = 0;

        for (const notification of unreadNotifications) {
            try {
                // Skip if user doesn't exist (orphaned notification)
                if (!notification.userId) {
                    notificationLogger.warn(`Notification ${notification.id} has no associated user, skipping...`);
                    continue;
                }

                await processUnreadNotification(notification);
                successCount++;
            } catch (error) {
                errorCount++;
                notificationLogger.error(`Failed to process notification ${notification.id}:`, error);
            }
        }

        notificationLogger.info(
            `Notifications processing completed. Success: ${successCount}, Errors: ${errorCount}`
        );

    } catch (error) {
        notificationLogger.error('Notifications checker command failed:', error);
        throw error;
    }
};

const processUnreadNotification = async (notification: Notification) => {
    const user = await userRepository.findById(notification.userId.toString());

    notificationLogger.debug(`Processing unread notification ${notification.id} for user ${notification.userId}`);

    try {
        // Send push notification via email
        if (user?.email) {
            await sendEmailNotification(notification, user as RestrictedUserDto);
        }

        // Mark as pushed to avoid sending again
        await notificationRepository.updateNotification({
            isPushed: true,
            pushAt: new Date()
        }, notification.id);

        notificationLogger.debug(`Successfully processed notification ${notification.id}`);

    } catch (error) {
        notificationLogger.error(`Error processing notification ${notification.id}:`, error);
        throw error;
    }
};

const sendEmailNotification = async (notification: Notification, user: RestrictedUserDto) => {
    try {
        const emailSubject = `Notification non lue: ${notification.title}`;

        // Format the notification date
        const notificationDate = new Date(notification.createdAt).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Generate the action URL
        const actionUrl = `${process.env.FRONTEND_URL}/notifications/${notification.id}`;

        // Render the email using React Email
        const emailContent = await render(
            NotificationAlertEmail({
                name: user.firstName || 'Utilisateur',
                title: notification.title,
                message: notification.message || '',
                type: notification.type,
                notificationDate: notificationDate,
                actionUrl: actionUrl
            })
        );

        // Send email using mailerService
        await mailerService.sendEmail(
            user.email,
            emailSubject,
            emailContent
        );

        //@TODO - create email
        
        notificationLogger.info(`Email notification sent to ${user.email} for notification ${notification.id}`);

    } catch (error) {
        notificationLogger.error(`Failed to send email notification to ${user.email}:`, error);
        throw error;
    }
};

