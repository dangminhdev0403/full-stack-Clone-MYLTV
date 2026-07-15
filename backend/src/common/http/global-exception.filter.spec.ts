import {
  BadRequestException,
  HttpStatus,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import type { Request, Response } from 'express';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  it('preserves validation details and a non-empty inbound request id', () => {
    const { filter, request, response } = createFilter('request-123');
    const details = [{ source: 'body', path: 'code', message: 'Required' }];

    filter.catch(
      new BadRequestException({
        message: 'Invalid request payload',
        details,
      }),
      createHost(request, response),
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload',
        details,
      },
      request_id: 'request-123',
    });
  });

  it('maps ordinary HTTP exceptions without inventing validation details', () => {
    const { filter, request, response } = createFilter('   ');

    filter.catch(
      new NotFoundException('Student not found'),
      createHost(request, response),
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Student not found',
      },
    });
  });

  it('hides internal exception details for unknown errors', () => {
    const { filter, request, response } = createFilter();

    filter.catch(
      new Error('database password leaked'),
      createHost(request, response),
    );

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      },
    });
  });

  it.each([
    {
      exception: new Error('database password leaked'),
      exceptionType: 'Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    },
    {
      exception: new ServiceUnavailableException({
        message: 'upstream token leaked',
        database: 'private connection details',
      }),
      exceptionType: 'ServiceUnavailableException',
      status: HttpStatus.SERVICE_UNAVAILABLE,
    },
  ])(
    'logs safe structured metadata for a $status server error',
    ({ exception, exceptionType, status }) => {
      const loggerError = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();
      const { filter, request, response } = createFilter('request-456');
      request.method = 'POST';
      Object.defineProperty(request, 'path', { value: '/api/v1/students' });

      filter.catch(exception, createHost(request, response));

      expect(loggerError).toHaveBeenCalledTimes(1);
      expect(loggerError).toHaveBeenCalledWith({
        exception_type: exceptionType,
        method: 'POST',
        path: '/api/v1/students',
        status,
        request_id: 'request-456',
      });
      expect(JSON.stringify(loggerError.mock.calls)).not.toContain('leaked');
      expect(JSON.stringify(loggerError.mock.calls)).not.toContain('private');

      loggerError.mockRestore();
    },
  );
});

function createFilter(requestId?: string) {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as jest.Mocked<Pick<Response, 'status' | 'json'>>;
  const request = {
    headers: requestId === undefined ? {} : { 'x-request-id': requestId },
  } as Request;

  return {
    filter: new GlobalExceptionFilter(),
    request,
    response,
  };
}

function createHost(
  request: Request,
  response: jest.Mocked<Pick<Response, 'status' | 'json'>>,
): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
      getNext: jest.fn(),
    }),
  } as ArgumentsHost;
}
