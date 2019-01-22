import {IExtractedResult} from '../runtime/types';

export function mergeEntryChunks(extractResults: IExtractedResult[]) {
  const entryMergedChunks = extractResults
    .filter(({chunk}) => chunk.canBeInitial())
    .reduce((chunkMap, currentResult) => {
      const currentChunk = currentResult.chunk;
      if (chunkMap.hasOwnProperty(currentChunk.id)) {
        chunkMap[currentChunk.id] = mergeExtractResults(chunkMap[currentChunk.id], currentResult);
      } else {
        chunkMap[currentChunk.id] = currentResult;
      }
      return chunkMap;
    }, {});

  return Object.keys(entryMergedChunks).map(key => entryMergedChunks[key]);
}

function mergeExtractResults(extractResult1, extractResult2) {
  const newResult = {...extractResult1};

  newResult.cssVars = {...newResult.cssVars, ...extractResult2.cssVars};
  newResult.customSyntaxStrs = newResult.customSyntaxStrs.concat(extractResult2.customSyntaxStrs);
  newResult.css += `\n${extractResult2.css}`;

  return newResult;
}
