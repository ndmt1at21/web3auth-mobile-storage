import { ErrorCodes, ITkeyError, TkeyError } from '@tkey/common-types';

export const ErrorCodeNumber = {
  DEFAULT: 10000,
  UNABLE_TO_READ_FROM_STORAGE: 11001,
  SHARE_UNAVAILABLE_IN_FILE_STORAGE: 11002,
};

class MobileStorageError extends TkeyError {
  protected static messages: ErrorCodes = {
    [ErrorCodeNumber.DEFAULT]: 'default',
    [ErrorCodeNumber.UNABLE_TO_READ_FROM_STORAGE]: 'unableToReadFromStorage',
    [ErrorCodeNumber.SHARE_UNAVAILABLE_IN_FILE_STORAGE]:
      'No Share exists in file system',
  };

  public constructor(code: number, message?: string) {
    // takes care of stack and proto
    super(code, message);
    // Set name explicitly as minification can mangle class names
    Object.defineProperty(this, 'name', { value: 'MobileStorageError' });
  }

  public static fromCode(code: number, extraMessage = ''): ITkeyError {
    return new MobileStorageError(
      code,
      `${MobileStorageError.messages[code]}${extraMessage}`
    );
  }

  public static default(extraMessage = ''): ITkeyError {
    return new MobileStorageError(
      3000,
      `${MobileStorageError.messages[3000]}${extraMessage}`
    );
  }

  // Custom methods
  public static unableToReadFromStorage(extraMessage = ''): ITkeyError {
    return MobileStorageError.fromCode(
      ErrorCodeNumber.UNABLE_TO_READ_FROM_STORAGE,
      extraMessage
    );
  }

  public static shareUnavailableInFileStorage(extraMessage = ''): ITkeyError {
    return MobileStorageError.fromCode(
      ErrorCodeNumber.SHARE_UNAVAILABLE_IN_FILE_STORAGE,
      extraMessage
    );
  }
}
export default MobileStorageError;
