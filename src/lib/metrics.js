export const CLASSES = ['positive', 'neutral', 'negative'];
export function computeMetrics(rows, predictions) {
  const matrix = CLASSES.map(() => CLASSES.map(() => 0));
  rows.forEach((row, i) => {
    const actual = CLASSES.indexOf(row.label);
    const predicted = CLASSES.indexOf(predictions[i]?.label);
    if (actual >= 0 && predicted >= 0) matrix[actual][predicted]++;
  });
  const count = rows.length;
  const diagonal = CLASSES.reduce((sum, _, i) => sum + matrix[i][i], 0);
  const per_class = CLASSES.map((label, i) => {
    const tp = matrix[i][i];
    const support = matrix[i].reduce((a,b) => a+b, 0);
    const predicted = matrix.reduce((sum, row) => sum + row[i], 0);
    const precision = predicted ? tp/predicted : 0;
    const recall = support ? tp/support : 0;
    return {label, support, precision, recall, f1: precision+recall ? 2*precision*recall/(precision+recall) : 0};
  });
  return {
    count, classes:CLASSES, matrix, per_class,
    accuracy:count?diagonal/count:0,
    precision:per_class.reduce((sum,x)=>sum+x.precision,0)/3,
    recall:per_class.reduce((sum,x)=>sum+x.recall,0)/3,
    f1:per_class.reduce((sum,x)=>sum+x.f1,0)/3,
  };
}
