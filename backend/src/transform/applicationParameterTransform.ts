import { ApplicationParameterDto } from '@shared/dto';

import { ApplicationParameter } from '@/config/client';

class ApplicationParameterTransform {
    public toApplicationParameterDto(parameter: ApplicationParameter): ApplicationParameterDto {
        return {
            id: parameter.id,
            name: parameter.name,
            value: parameter.value,
            createdAt: parameter.createdAt.toISOString(),
            updatedAt: parameter.updatedAt.toISOString(),
        };
    }
}

export const applicationParameterTransform = new ApplicationParameterTransform();
