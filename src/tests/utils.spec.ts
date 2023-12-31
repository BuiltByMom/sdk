import { PoolUtils } from '../classes/PoolUtils';
import { fromWad, max, min, toWad, wsqrt, wdiv, wmul } from '../utils/numeric';
import {
  indexToPrice as indexToPriceLocal,
  priceToIndex as priceToIndexLocal,
} from '../utils/pricing';
import { TEST_CONFIG as config } from './test-constants';
import { BigNumber, constants, providers } from 'ethers';

jest.setTimeout(1200000);

describe('Utility tests', () => {
  const provider = new providers.JsonRpcProvider(config.ETH_RPC_URL);
  const utils = new PoolUtils(provider);

  it('should convert to and from WAD precision', async () => {
    const price = '112.20070213';
    const priceWad = BigNumber.from('0x61518f81f58107400');
    expect(toWad(price)).toEqual(priceWad);
    expect(toWad(112.20070213)).toEqual(priceWad);
    expect(fromWad('112200702130000000000')).toEqual(price);
    expect(fromWad(priceWad.toString())).toEqual(price);
  });

  it('should convert from index to price using contract call', async () => {
    expect(await utils.indexToPrice(0)).toEqual(toWad('1004968987.606512354182109771'));
    expect(await utils.indexToPrice(2632)).toEqual(toWad('2000.221618840727700609'));
    expect(await utils.indexToPrice(3232)).toEqual(toWad('100.332368143282009890'));
    expect(await utils.indexToPrice(4156)).toEqual(toWad('1.00000000000000000'));
    expect(await utils.indexToPrice(5156)).toEqual(toWad('0.006822416727411372'));
    expect(await utils.indexToPrice(7388)).toEqual(toWad('0.00000009983628289'));
  });

  it('should convert from index to price using local implementation', async () => {
    expect(indexToPriceLocal(0)).toEqual(toWad('1004968987.606512354182109771'));
    expect(indexToPriceLocal(2632)).toEqual(toWad('2000.221618840727700609'));
    expect(indexToPriceLocal(3232)).toEqual(toWad('100.332368143282009890'));
    expect(indexToPriceLocal(4156)).toEqual(toWad('1.00000000000000000'));
    expect(indexToPriceLocal(5156)).toEqual(toWad('0.006822416727411372'));
    expect(indexToPriceLocal(7388)).toEqual(toWad('0.00000009983628289'));
  });

  it('should convert from price to index using contract call', async () => {
    expect(await utils.priceToIndex(toWad('2000'))).toEqual(BigNumber.from(2632));
    expect(await utils.priceToIndex(toWad('100.0'))).toEqual(BigNumber.from(3232));
    expect(await utils.priceToIndex(toWad('1.0'))).toEqual(BigNumber.from(4156));
    expect(await utils.priceToIndex(toWad('0.00682'))).toEqual(BigNumber.from(5156));
  });

  it('should convert from price to index using local implementation', async () => {
    expect(priceToIndexLocal(toWad('2000'))).toEqual(2632);
    expect(priceToIndexLocal(toWad('100.0'))).toEqual(3232);
    expect(priceToIndexLocal(toWad('1.0'))).toEqual(4156);
    expect(priceToIndexLocal(toWad('0.00682'))).toEqual(5156);
  });

  it('should revert if price out of bounds', async () => {
    await expect(utils.indexToPrice(9999)).rejects.toThrow('reverted');

    expect(() => {
      indexToPriceLocal(9999);
    }).toThrow('ERR_BUCKET_INDEX_OUT_OF_BOUNDS');

    await expect(utils.priceToIndex(toWad('1222333444'))).rejects.toThrow('reverted');
    await expect(utils.priceToIndex(toWad('0.00000005'))).rejects.toThrow('reverted');

    expect(() => {
      priceToIndexLocal(toWad('1222333444'));
    }).toThrow('ERR_BUCKET_PRICE_OUT_OF_BOUNDS');
    expect(() => {
      priceToIndexLocal(toWad('0.00000005'));
    }).toThrow('ERR_BUCKET_PRICE_OUT_OF_BOUNDS');
  });

  it('should multiply and divide WADs', async () => {
    expect(wmul(toWad(500), toWad('1.53')).eq(toWad(765))).toBeTruthy();
    expect(wdiv(toWad(20140520), toWad(8)).eq(toWad(2517565))).toBeTruthy();
  });

  it('uint256_max constant should return the expected value', async () => {
    expect(constants.MaxUint256).toEqual(
      BigNumber.from(
        '115792089237316195423570985008687907853269984665640564039457584007913129639935'
      )
    );
  });

  it('min should function as expected', async () => {
    expect(min(toWad('3.5'), toWad('1.8')).eq(toWad('1.8')));
    expect(min(toWad('5611'), toWad('80211')).eq(toWad('5611')));
  });

  it('max should function as expected', async () => {
    expect(max(toWad('38.062'), toWad('22.6845977')).eq(toWad('38.062')));
    expect(max(toWad(4), toWad(0)).eq(toWad(4)));
    expect(max(toWad(37), toWad(74536)).eq(toWad(74536)));
  });

  it('should calculate square roots as expected', async () => {
    expect(wsqrt(toWad('4'))).toEqual(toWad('2'));
    expect(wsqrt(toWad(9))).toEqual(toWad(3));
    expect(wsqrt(toWad('200702.13'))).toEqual(toWad('447.9979129415671731'));
    expect(wsqrt(toWad('0.0923201'))).toEqual(toWad('0.303842228796459429'));
  });
});
