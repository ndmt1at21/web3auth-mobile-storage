import {
  BNString,
  DeviceShareDescription,
  IModule,
  ITKeyApi,
  prettyPrintError,
  ShareStore,
  StringifiedType,
} from '@tkey/common-types';
import BN from 'bn.js';

import MobileStorageError from './errors';
import {
  getShareFromFileStorage,
  storeShareOnFileStorage,
} from './FileStorageHelpers';

import UserAgent from 'react-native-user-agent';

export const MOBILE_STORAGE_MODULE_NAME = 'mobileStorage';

class MobileStorageModule implements IModule {
  moduleName: string;

  // @ts-ignore
  tbSDK: ITKeyApi;

  canUseFileStorage: boolean;

  constructor(canUseFileStorage = true) {
    this.moduleName = MOBILE_STORAGE_MODULE_NAME;
    this.canUseFileStorage = canUseFileStorage;
  }

  setModuleReferences(tbSDK: ITKeyApi): void {
    this.tbSDK = tbSDK;
    this.tbSDK._setDeviceStorage(this.storeDeviceShare.bind(this));
  }

  async initialize(): Promise<void> {}

  async storeDeviceShare(
    deviceShareStore: ShareStore,
    customDeviceInfo?: StringifiedType
  ): Promise<void> {
    const metadata = this.tbSDK.getMetadata();
    const tkeypubx = metadata.pubKey.x.toString('hex');

    await storeShareOnFileStorage(deviceShareStore, tkeypubx);

    const shareDescription: DeviceShareDescription = {
      module: this.moduleName,
      userAgent: UserAgent.getUserAgent(),
      dateAdded: Date.now(),
    };

    if (customDeviceInfo) {
      shareDescription.customDeviceInfo = JSON.stringify(customDeviceInfo);
    }

    await this.tbSDK.addShareDescription(
      deviceShareStore.share.shareIndex.toString('hex'),
      JSON.stringify(shareDescription),
      true
    );
  }

  async storeDeviceShareOnFileStorage(shareIndex: BNString): Promise<void> {
    const metadata = this.tbSDK.getMetadata();
    const tkeypubx = metadata.pubKey.x.toString('hex');
    const shareStore = this.tbSDK.outputShareStore(new BN(shareIndex));

    return storeShareOnFileStorage(shareStore, tkeypubx);
  }

  async getDeviceShare(): Promise<ShareStore> {
    const metadata = this.tbSDK.getMetadata();
    const tkeypubx = metadata.pubKey.x.toString('hex');
    let shareStore: ShareStore;

    try {
      shareStore = await getShareFromFileStorage(tkeypubx);
    } catch (localErr: any) {
      throw MobileStorageError.unableToReadFromStorage(
        `Error inputShareFromMobileStorage: ${prettyPrintError(localErr)}`
      );
    }
    return shareStore;
  }

  async inputShareFromWebStorage(): Promise<void> {
    const shareStore = await this.getDeviceShare();
    let latestShareStore = shareStore;
    const metadata = this.tbSDK.getMetadata();

    if (
      metadata.getLatestPublicPolynomial().getPolynomialID() !==
      shareStore.polynomialID
    ) {
      latestShareStore = (
        await this.tbSDK.catchupToLatestShare({
          shareStore,
          includeLocalMetadataTransitions: true,
        })
      ).latestShare;

      const tkeypubx = metadata.pubKey.x.toString('hex');
      await storeShareOnFileStorage(latestShareStore, tkeypubx);
    }

    this.tbSDK.inputShareStore(latestShareStore);
  }
}

export default MobileStorageModule;
