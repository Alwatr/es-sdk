import {AlwatrCryptoFactory} from '@alwatr/crypto';
import {writeJsonFile} from '@alwatr/util/node.js';

const userFactory = new AlwatrCryptoFactory({
  secret: 'my-very-secret-key',
  duration: '1y',
});

for (let i = 10_000; i > 0; i--) {
  const id = userFactory.generateUserId();
  const id2 = id.slice(0, 3) + '/' + id;
  const data = {id, hello: 'world'};
  const fileName1 = `${process.env.HOME}/temp1/${id}.json`;
  const fileName2 = `${process.env.HOME}/temp2/${id2}.json`;
  await writeJsonFile(fileName1, data);
  await writeJsonFile(fileName2, data);
}
