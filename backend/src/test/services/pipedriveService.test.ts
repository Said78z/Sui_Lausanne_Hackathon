import { PipedriveService } from '@/services/pipedriveService';
import {
    PipedriveActivityCreate,
    PipedriveDealCreate,
    PipedriveLeadCreate,
    PipedriveNoteCreate,
    PipedrivePersonCreate,
    PipedriveUserCreate
} from '@/services/pipedriveTypes';
import { afterAll, beforeEach, describe, expect, jest, test } from '@jest/globals';

// Mock the HTTP client interface
interface MockHttpClient {
    get: jest.MockedFunction<any>;
    post: jest.MockedFunction<any>;
    put: jest.MockedFunction<any>;
    delete: jest.MockedFunction<any>;
}

describe('PipedriveService', () => {
    let pipedriveService: PipedriveService;
    let mockHttp: MockHttpClient;
    const mockApiToken = 'test-api-token';
    const mockApiUrl = 'https://api.pipedrive.com';

    beforeEach(() => {
        jest.clearAllMocks();
        pipedriveService = new PipedriveService(mockApiToken, mockApiUrl);

        // Create a properly typed mock HTTP client
        mockHttp = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn()
        };

        // Inject the mock HTTP client
        (pipedriveService as any).http = mockHttp;
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('Constructor', () => {
        test('devrait créer une instance avec les paramètres corrects', () => {
            expect(pipedriveService).toBeInstanceOf(PipedriveService);
        });
    });

    describe('getPersons', () => {
        test('devrait récupérer les personnes avec succès', async () => {
            const mockResponseData = {
                data: [
                    { id: 1, name: 'John Doe', email: 'john@example.com' },
                    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
                ],
                success: true
            };

            mockHttp.get.mockResolvedValue({ data: mockResponseData });

            const params = { limit: 10, cursor: 'test-cursor' };
            const result = await pipedriveService.getPersons(params);

            expect(mockHttp.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/v2/persons')
            );
            expect(result).toEqual(mockResponseData);
        });

        test('devrait gérer les erreurs lors de la récupération des personnes', async () => {
            const mockError = new Error('API Error');
            mockHttp.get.mockRejectedValue(mockError);

            await expect(pipedriveService.getPersons({}))
                .rejects.toThrow('API Error');
        });
    });

    describe('createPerson', () => {
        test('devrait créer une personne avec succès', async () => {
            const personData: PipedrivePersonCreate = {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+1234567890'
            };

            const mockResponseData = {
                data: { id: 1, ...personData },
                success: true
            };

            mockHttp.post.mockResolvedValue({ data: mockResponseData });

            const result = await pipedriveService.createPerson(personData);

            expect(mockHttp.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/v2/persons'),
                personData
            );
            expect(result).toEqual(mockResponseData);
        });
    });

    describe('getDeals', () => {
        test('devrait récupérer les deals avec succès', async () => {
            const mockResponseData = {
                data: [
                    { id: 1, title: 'Deal 1', value: 10000 },
                    { id: 2, title: 'Deal 2', value: 20000 }
                ],
                success: true
            };

            mockHttp.get.mockResolvedValue({ data: mockResponseData });

            const params = { limit: 10, pipeline_id: 1 };
            const result = await pipedriveService.getDeals(params);

            expect(mockHttp.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/v2/deals')
            );
            expect(result).toEqual(mockResponseData);
        });
    });

    describe('createDeal', () => {
        test('devrait créer un deal avec succès', async () => {
            const dealData: PipedriveDealCreate = {
                title: 'New Deal',
                value: 50000,
                currency: 'USD',
                person_id: 1,
                org_id: 1
            };

            const mockResponseData = {
                data: { id: 1, ...dealData },
                success: true
            };

            mockHttp.post.mockResolvedValue({ data: mockResponseData });

            const result = await pipedriveService.createDeal(dealData);

            expect(mockHttp.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/v2/deals'),
                dealData
            );
            expect(result).toEqual(mockResponseData);
        });
    });

    describe('getLeads', () => {
        test('devrait récupérer les leads avec succès', async () => {
            const mockResponseData = {
                data: [
                    { id: 'lead-1', title: 'Lead 1', value: { amount: 10000, currency: 'USD' } },
                    { id: 'lead-2', title: 'Lead 2', value: { amount: 20000, currency: 'USD' } }
                ],
                success: true
            };

            mockHttp.get.mockResolvedValue({ data: mockResponseData });

            const params = { limit: 10, owner_id: 1 };
            const result = await pipedriveService.getLeads(params);

            expect(mockHttp.get).toHaveBeenCalledWith(
                expect.stringContaining('/v1/leads')
            );
            expect(result).toEqual(mockResponseData);
        });
    });

    describe('createLead', () => {
        test('devrait créer un lead avec succès', async () => {
            const leadData: PipedriveLeadCreate = {
                title: 'New Lead',
                person_id: 1,
                value: { amount: 15000, currency: 'USD' },
                expected_close_date: '2024-12-31'
            };

            const mockResponseData = {
                data: { id: 'lead-1', ...leadData },
                success: true
            };

            mockHttp.post.mockResolvedValue({ data: mockResponseData });

            const result = await pipedriveService.createLead(leadData);

            expect(mockHttp.post).toHaveBeenCalledWith(
                expect.stringContaining('/v1/leads'),
                expect.objectContaining({
                    title: leadData.title,
                    person_id: leadData.person_id,
                    value: leadData.value,
                    expected_close_date: leadData.expected_close_date
                })
            );
            expect(result).toEqual(mockResponseData);
        });
    });

    describe('getActivities', () => {
        test('devrait récupérer les activités avec succès', async () => {
            const mockResponseData = {
                data: [
                    { id: 1, subject: 'Call', type: 'call' },
                    { id: 2, subject: 'Meeting', type: 'meeting' }
                ],
                success: true
            };

            mockHttp.get.mockResolvedValue({ data: mockResponseData });

            const params = { limit: 10, type: 'call' };
            const result = await pipedriveService.getActivities(params);

            expect(mockHttp.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/v2/activities')
            );
            expect(result).toEqual(mockResponseData);
        });
    });

    describe('createActivity', () => {
        test('devrait créer une activité avec succès', async () => {
            const activityData: PipedriveActivityCreate = {
                subject: 'Follow-up Call',
                type: 'call',
                due_date: '2024-12-31',
                due_time: '14:00',
                person_id: 1
            };

            const mockResponseData = {
                data: { id: 1, ...activityData },
                success: true
            };

            mockHttp.post.mockResolvedValue({ data: mockResponseData });

            const result = await pipedriveService.createActivity(activityData);

            expect(mockHttp.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/v2/activities'),
                expect.objectContaining({
                    subject: activityData.subject,
                    type: activityData.type,
                    due_date: activityData.due_date,
                    due_time: activityData.due_time,
                    participants: [
                        {
                            person_id: activityData.person_id,
                            primary: true
                        }
                    ]
                })
            );
            expect(result).toEqual(mockResponseData);
        });
    });

    describe('getNotes', () => {
        test('devrait récupérer les notes avec succès', async () => {
            const mockResponseData = {
                data: [
                    { id: 1, content: 'Note 1' },
                    { id: 2, content: 'Note 2' }
                ],
                success: true
            };

            mockHttp.get.mockResolvedValue({ data: mockResponseData });

            const params = { limit: 10, start: 0 };
            const result = await pipedriveService.getNotes(params);

            expect(mockHttp.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/notes')
            );
            expect(result).toEqual(mockResponseData);
        });
    });

    describe('createNote', () => {
        test('devrait créer une note avec succès', async () => {
            const noteData: PipedriveNoteCreate = {
                content: 'This is a test note',
                person_id: 1,
                deal_id: 1
            };

            const mockResponseData = {
                data: { id: 1, ...noteData },
                success: true
            };

            mockHttp.post.mockResolvedValue({ data: mockResponseData });

            const result = await pipedriveService.createNote(noteData);

            expect(mockHttp.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/notes'),
                noteData
            );
            expect(result).toEqual(mockResponseData);
        });
    });

    describe('getUsers', () => {
        test('devrait récupérer les utilisateurs avec succès', async () => {
            const mockResponseData = {
                data: [
                    { id: 1, name: 'User 1', email: 'user1@example.com' },
                    { id: 2, name: 'User 2', email: 'user2@example.com' }
                ],
                success: true
            };

            mockHttp.get.mockResolvedValue({ data: mockResponseData });

            const params = { limit: 10 };
            const result = await pipedriveService.getUsers(params);

            expect(mockHttp.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/users')
            );
            expect(result).toEqual(mockResponseData);
        });
    });

    describe('createUser', () => {
        test('devrait créer un utilisateur avec succès', async () => {
            const userData: PipedriveUserCreate = {
                email: 'newuser@example.com',
                active_flag: true
            };

            const mockResponseData = {
                data: { id: 1, ...userData },
                success: true
            };

            mockHttp.post.mockResolvedValue({ data: mockResponseData });

            const result = await pipedriveService.createUser(userData);

            expect(mockHttp.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/users'),
                userData
            );
            expect(result).toEqual(mockResponseData);
        });
    });

    describe('getNote', () => {
        test('devrait récupérer une note spécifique avec succès', async () => {
            const noteId = '123';
            const mockResponseData = {
                data: { id: noteId, content: 'Test note content' },
                success: true
            };

            mockHttp.get.mockResolvedValue({ data: mockResponseData });

            const result = await pipedriveService.getNote(noteId);

            expect(mockHttp.get).toHaveBeenCalledWith(
                expect.stringContaining(`/api/v1/notes/${noteId}`)
            );
            expect(result).toEqual(mockResponseData);
        });
    });

    describe('updateNote', () => {
        test('devrait mettre à jour une note avec succès', async () => {
            const noteId = '123';
            const updateData = { content: 'Updated note content' };

            const mockResponseData = {
                data: { id: noteId, ...updateData },
                success: true
            };

            mockHttp.put.mockResolvedValue({ data: mockResponseData });

            const result = await pipedriveService.updateNote(noteId, updateData);

            expect(mockHttp.put).toHaveBeenCalledWith(
                expect.stringContaining(`/api/v1/notes/${noteId}`),
                updateData
            );
            expect(result).toEqual(mockResponseData);
        });
    });

    describe('deleteNote', () => {
        test('devrait supprimer une note avec succès', async () => {
            const noteId = '123';
            const mockResponseData = {
                data: { id: noteId },
                success: true
            };

            mockHttp.delete.mockResolvedValue({ data: mockResponseData });

            const result = await pipedriveService.deleteNote(noteId);

            expect(mockHttp.delete).toHaveBeenCalledWith(
                expect.stringContaining(`/api/v1/notes/${noteId}`)
            );
            expect(result).toEqual(mockResponseData);
        });
    });

    describe('getNoteComments', () => {
        test('devrait récupérer les commentaires d\'une note avec succès', async () => {
            const noteId = '123';
            const params = { start: 0, limit: 10 };

            const mockResponseData = {
                data: [
                    { id: 1, content: 'Comment 1' },
                    { id: 2, content: 'Comment 2' }
                ],
                success: true
            };

            mockHttp.get.mockResolvedValue({ data: mockResponseData });

            const result = await pipedriveService.getNoteComments(noteId, params);

            expect(mockHttp.get).toHaveBeenCalledWith(
                expect.stringContaining(`/api/v1/notes/${noteId}/comments`)
            );
            expect(result).toEqual(mockResponseData);
        });
    });

    describe('createNoteComment', () => {
        test('devrait créer un commentaire pour une note avec succès', async () => {
            const noteId = '123';
            const content = 'New comment content';

            const mockResponseData = {
                data: { id: 1, content },
                success: true
            };

            mockHttp.post.mockResolvedValue({ data: mockResponseData });

            const result = await pipedriveService.createNoteComment(noteId, content);

            expect(mockHttp.post).toHaveBeenCalledWith(
                expect.stringContaining(`/api/v1/notes/${noteId}/comments`),
                { content }
            );
            expect(result).toEqual(mockResponseData);
        });
    });
});