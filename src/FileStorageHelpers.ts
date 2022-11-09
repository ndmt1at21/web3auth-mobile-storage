import MobileStorageError from './errors';
import { ShareStore } from '@tkey/common-types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getShareFromFileStorage = async (
  key: string
): Promise<ShareStore> => {
  try {
    const fileStr = await AsyncStorage.getItem(key);

    if (!fileStr) {
      throw MobileStorageError.shareUnavailableInFileStorage();
    }

    return ShareStore.fromJSON(JSON.parse(fileStr));
  } catch (err) {
    throw MobileStorageError.unableToReadFromStorage();
  }
};

export const storeShareOnFileStorage = async (
  share: ShareStore,
  key: string
): Promise<void> => {
  const fileName = `${key}.json`;
  const fileStr = JSON.stringify(share);

  try {
    await AsyncStorage.setItem(fileName, fileStr);
  } catch (err) {
    throw MobileStorageError.unableToReadFromStorage();
  }
};
