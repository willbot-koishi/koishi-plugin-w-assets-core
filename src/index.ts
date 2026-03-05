import { Readable } from 'node:stream'

import { Context } from 'koishi'
import Assets from '@koishijs/assets'

declare module 'koishi' {
  interface Context {
    assetsPro: AssetsPro
  }
}

abstract class AssetsPro<T extends AssetsPro.Config = AssetsPro.Config> extends Assets<T> {
  static name = 'assetsPro'
  static inject = ['database', 'server']

  /**
   * Transfer the asset from the source URL to the storage and return the new URL.
   * @param url
   * @param filename
   */
  upload(url: string, filename: string): Promise<string>
  upload(url: string, info: AssetCreateInfo): Promise<string>
  async upload(url: string, infoOrFilename: string | AssetCreateInfo): Promise<string> {
    const info: AssetCreateInfo = typeof infoOrFilename === 'string'
      ? { name: infoOrFilename }
      : infoOrFilename
    const { url: urlNew } = await this.uploadFromUrl(url, info)
    return urlNew
  }

  abstract uploadFromUrl(url: string, info: AssetCreateInfo): Promise<AssetUsageInfo>
  abstract uploadFromFile(file: Buffer | Readable | string, info: AssetCreateInfo): Promise<AssetUsageInfo>
  abstract delete(id: string): Promise<boolean>
  abstract gc(options: GcOptions): Promise<GcResult>

  abstract stats(): Promise<AssetsPro.Stats>

  constructor(ctx: Context, config: T) {
    super(ctx, config)

    ctx.set('assetsPro', this)
  }
}

namespace AssetsPro {
  export interface Config extends Assets.Config {}

  export interface Stats extends Assets.Stats {
    id: 1
  }
}

export default AssetsPro

export interface AssetCreateInfo {
  name?: string
  type?: string
  categoryId?: string
  sourceUrl?: string
  life?: number
}

export interface AssetInfo extends AssetCreateInfo {
  id: string
  name: string
  size: number
  checksum: string
  createdAt: number
  expiresAt: number
}

export interface AssetUsageInfo extends AssetInfo {
  url: string
}

export namespace AssetLife {
  export const Auto = 0
  export const Permanent = -1
}

export interface GcOptions {}

export interface GcResult {
  count: number
  size: number
}
