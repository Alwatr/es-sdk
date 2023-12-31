import {existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, renameSync} from 'node:fs';
import {mkdir, writeFile, readFile, rm, symlink, copyFile, rename} from 'node:fs/promises';
import {dirname} from 'node:path';

import {createLogger} from '@alwatr/logger';

import {flatStr} from '../flat-str.js';

import type {StringifyableRecord} from '@alwatr/type';

const logger = createLogger('alwatr/util/fs', true);

/**
 * Enhanced read json file.
 * @example
 * const fileContent = readJsonFileSync('./file.json');
 */
export const readJsonFileSync = <T extends StringifyableRecord = StringifyableRecord>(path: string): T | null => {
  logger.logMethodArgs?.('readJsonFileSync', path);

  if (!existsSync(path)) {
    return null;
  }

  const timeKey = path.substring(path.lastIndexOf('/') + 1);

  let fileContent: string;
  logger.time?.(`readFileSync ${timeKey}`);
  try {
    fileContent = flatStr(readFileSync(path, {encoding: 'utf-8', flag: 'r'}));
  }
  catch (err) {
    logger.error('readJsonFileSync', 'read_file_failed', err);
    throw new Error('read_file_failed');
  }
  logger.timeEnd?.(`readFileSync ${timeKey}`);

  let data;
  logger.time?.(`jsonParse ${timeKey}`);
  try {
    data = JSON.parse(fileContent) as T;
  }
  catch (err) {
    logger.error('readJsonFileSync', 'invalid_json', err);
    throw new Error('invalid_json');
  }
  logger.timeEnd?.(`jsonParse ${timeKey}`);

  return data;
};

/**
 * Enhanced read json file.
 * @example
 * const fileContent = await readJsonFile('./file.json');
 */
export const readJsonFile = async <T extends StringifyableRecord = StringifyableRecord>(
  path: string,
): Promise<T | null> => {
  logger.logMethodArgs?.('readJsonFileSync', path);

  if (!existsSync(path)) {
    // existsSync is much faster than access.
    return null;
  }

  const timeKey = path.substring(path.lastIndexOf('/') + 1);

  let fileContent: string;
  logger.time?.(`readFile ${timeKey}`);
  try {
    fileContent = flatStr(await readFile(path, {encoding: 'utf-8', flag: 'r'}));
  }
  catch (err) {
    logger.error('readJsonFile', 'read_file_failed', err);
    throw new Error('read_file_failed');
  }
  logger.timeEnd?.(`readFile ${timeKey}`);

  let data;
  logger.time?.(`jsonParse ${timeKey}`);
  try {
    data = JSON.parse(fileContent) as T;
  }
  catch (err) {
    logger.error('readJsonFile', 'invalid_json', err);
    throw new Error('invalid_json');
  }
  logger.timeEnd?.(`jsonParse ${timeKey}`);

  return data;
};

/**
 * Enhanced write json file.
 * @example
 * writeJsonFileSync('./file.json', { a:1, b:2, c:3 });
 */
export const writeJsonFileSync = <T extends StringifyableRecord = StringifyableRecord>(
  path: string,
  data: T,
  existFile: 'replace' | 'copy' | 'rename' = 'replace',
  space?: string | number,
): void => {
  logger.logMethodArgs?.('writeJsonFileSync', path);

  const timeKey = path.substring(path.lastIndexOf('/') + 1);

  let jsonContent;
  logger.time?.(`jsonParse ${timeKey}`);
  try {
    jsonContent = flatStr(JSON.stringify(data, null, space));
  }
  catch (err) {
    logger.error('writeJsonFileSync', 'stringify_failed', err);
    throw new Error('stringify_failed');
  }
  logger.timeEnd?.(`jsonParse ${timeKey}`);

  if (existsSync(path)) {
    try {
      if (existFile === 'copy') {
        copyFileSync(path, path + '.bk');
      }
      else if (existFile === 'rename') {
        renameSync(path, path + '.bk');
      }
    }
    catch (err) {
      logger.error('writeJsonFileSync', 'rename_copy_failed', err);
    }
  }
  else {
    try {
      mkdirSync(dirname(path), {recursive: true});
    }
    catch (err) {
      logger.error('writeJsonFileSync', 'make_dir_failed', err);
      throw new Error('make_dir_failed');
    }
  }

  logger.time?.(`writeFileSync ${timeKey}`);
  try {
    writeFileSync(path, jsonContent, {encoding: 'utf-8', flag: 'w'});
  }
  catch (err) {
    logger.error('writeJsonFileSync', 'write_file_failed', err);
    throw new Error('write_file_failed');
  }
  logger.timeEnd?.(`writeFileSync ${timeKey}`);
};

/**
 * Enhanced write json file.
 * @example
 * await writeJsonFile('./file.json', { a:1, b:2, c:3 });
 */
export const writeJsonFile = async <T extends StringifyableRecord = StringifyableRecord>(
  path: string,
  data: T,
  existFile: 'replace' | 'copy' | 'rename' = 'replace',
  space?: string | number,
): Promise<void> => {
  logger.logMethodArgs?.('writeJsonFile', path);

  const timeKey = path.substring(path.lastIndexOf('/') + 1);
  logger.time?.(`writeJsonFile(${timeKey})`);

  let jsonContent;
  logger.time?.(`jsonParse ${timeKey}`);
  try {
    jsonContent = flatStr(JSON.stringify(data, null, space));
  }
  catch (err) {
    logger.error('writeJsonFile', 'stringify_failed', err);
    throw new Error('stringify_failed');
  }
  logger.timeEnd?.(`jsonParse ${timeKey}`);

  if (existsSync(path)) {
    try {
      if (existFile === 'copy') {
        await copyFile(path, path + '.bk');
      }
      else if (existFile === 'rename') {
        await rename(path, path + '.bk');
      }
    }
    catch (err) {
      logger.error('writeJsonFile', 'rename_copy_failed', err);
    }
  }
  else {
    try {
      await mkdir(dirname(path), {recursive: true});
    }
    catch (err) {
      logger.error('writeJsonFile', 'make_dir_failed', err);
      throw new Error('make_dir_failed');
    }
  }

  logger.time?.(`writeFile ${timeKey}`);
  try {
    await writeFile(path, jsonContent, {encoding: 'utf-8', flag: 'w'});
  }
  catch (err) {
    logger.error('writeJsonFile', 'write_file_failed', err);
    throw new Error('write_file_failed');
  }
  logger.timeEnd?.(`writeFile ${timeKey}`);
};

/**
 * Make a symbolic link
 *
 * **CAUTION: the destination path will be removed if exists**
 */
export const makeLinkForce = async (src: string, dest: string): Promise<void> => {
  logger.logMethodArgs?.('makeLink', {src, dest});

  try {
    if (existsSync(dest)) {
      await rm(dest, {recursive: false, force: true});
    }
    else {
      const destDir = dirname(dest);
      if (!existsSync(destDir)) {
        await mkdir(dirname(dest), {recursive: true});
      }
    }

    await symlink(src, dest);
  }
  catch (error) {
    logger.error('makeLink', 'symlink_failed', error);
    throw error;
  }
};
