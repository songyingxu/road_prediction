// var data_mdd = ee.FeatureCollection('ft:16yw5_3_OpB7iKxEJvuEvHQxmO8MLmyWtu37XIvUR');//100m per pixel only
// var data_mdd = ee.FeatureCollection('ft:1H_z-C0xOUKexclxHY4Y1WXW6p8_h66wBO3BosXsk');//100m with 7x7 kernel as class
// var data_mdd = ee.FeatureCollection('ft:14lgXr2NBbZwEWOfM-1YRvlBMXjMM9ykuJaNh5OSA');//100m with 7x7 kernel as feature, cluster as class
// var data_mdd = ee.FeatureCollection('ft:1FjiBJkcGTegHA-noNbcW8-fVhpgbvnYWwhX8cX5g');//100m with 7x7 kernel as feature, cluster as class, distance any


var data_mdd = ee.FeatureCollection('ft:1K-5OHIFryufJLhREtXmBSyISDcPFXIstSb5hTTgw');//100m with 7x7 kernel as feature, cluster as class, distance any_ version 2
// var data_iquitos = ee.FeatureCollection('ft:1q0dXaGYAHgvn3DJAaTkBLwLcyzkgcXC5hgvEE3US')//100m with 7x7 kernel as feature, cluster as class, distance any_ version 2
// var data_tarapoto = ee.FeatureCollection('ft:1idZkEa4g6szZNjH3KVN9ylM8gaorz0CDx_QyWkup')//100m with 7x7 kernel as feature, cluster as class, distance any_ version 2
// var data_pucallpa = ee.FeatureCollection('ft:1fy7hfXsmsvKGlPUS1bSlCnob-4Qc1vBgYsVIT3KZ')//100m with 7x7 kernel as feature, cluster as class, distance any_ version 2
// var data_ucayali = ee.FeatureCollection('ft:1ThkqBDYL5Y594XYcPotXhl1cuXKNLnX0MZTt9Hfm')//100m with 7x7 kernel as feature, cluster as class, distance any_ version 2

// var data_peru = ee.FeatureCollection([data_mdd, data_iquitos, data_tarapoto, data_pucallpa, data_ucayali]).flatten()
// Export.table.toDrive(data_peru)
// var data_base=ee.Image.cat(db,pixlatlon,defo_7x7)
var data_base=ee.Image.cat(db_2,pixlatlon,defo_7x7) //data_pre version 3

// Partition the training.
var training_mixed=data_mdd
// var training_mixed=data_iquitos
// var training_mixed=data_peru


training_mixed = training_mixed.randomColumn({ seed: 1 });

var training = training_mixed.filter(ee.Filter.lt('random', 0.7));
var validation =training_mixed.filter(ee.Filter.gte('random', 0.7));

// train a randomforest classifier
// var bands =  ['longitude', 'latitude', 'distance_vec','distance_dep','distance_nac',
// 'carbon_density','altitude'];

// var bands =  ['distance_dep','distance_vec','distance_nac','altitude','distance_parks','distance_buffer',
//               'distance_villages','latitude','longitude','distance_any','cluster_mean']; // ALL BANDS

// var bands =  ['distance_dep','distance_vec','distance_nac','altitude','distance_parks','distance_buffer',
//               'distance_villages','latitude','longitude','distance_any','cluster_mean']; //  - carbon_density

var bands =  ['distance_dep','distance_vec','distance_nac','altitude','distance_parks','distance_buffer',
              'distance_villages','latitude','longitude','distance_any']; //  - carbon_density, -cluster_mean

// var bands =  ['distance_dep','distance_vec','distance_nac','altitude','distance_parks','distance_buffer',
              // 'distance_villages','distance_any']; //  - carbon_density, -cluster_mean, -lotlan
// var bands =  ['distance_dep','distance_vec','distance_nac','altitude','distance_parks','distance_buffer',
//               'distance_villages','distance_any','cluster_mean']; //  - carbon_density -latlon //regression

///////////////////////////////////////////// SEARCHING HYPERPARAMETERS
// var numTrees = ee.List.sequence(200,400,100);
// print(numTrees)
// var accuracies = numTrees.map(function(t) {
  
//         var classifier = ee.Classifier.randomForest({
//               numberOfTrees: t, 
//               bagFraction:0.2,
//               seed:1,
//               outOfBagMode:true}).train({
//               features: training,
//               classProperty: 'cluster',
//               inputProperties: bands
//             }).setOutputMode('CLASSIFICATION')
//             ; 
//   return validation
//     .classify(classifier)
//     .errorMatrix('cluster', 'classification')
//     .accuracy();
// });
// print(accuracies)
// print(ui.Chart.array.values({
//   array: ee.Array(accuracies), 
//   axis: 0, 
//   xLabels: numTrees
// }).setOptions({
//       title: 'Parameters search',
//       legend: 'none',
//       hAxis: { title: 'Number of trees'},
//       vAxis: { title: 'Accuracy'},
//       lineWidth: 1
// }));

/////////////////////////////////////////////////////////////////////////////
///////////////////////////////CLASSIYING FINAL MODEL
/////////////////////////////////////////////////////////////////////////////

var classifier = ee.Classifier.randomForest({
  numberOfTrees: 80, 
  bagFraction:0.2,
  seed:1,
  outOfBagMode:true}).train({
  features: training,
  classProperty: 'cluster',
  inputProperties: bands
// }).setOutputMode('CLASSIFICATION')                      //Comment 
}).setOutputMode('PROBABILITY')                      //Uncomment for probability mode
// }).setOutputMode('REGRESSION')                          //Uncomment for REGRESSION mode
;  
// var classifier = ee.Classifier.gmoMaxEnt({
//   maxIterations:200
// }).train({
//   features: training,
//   classProperty: 'cluster',
//   inputProperties: bands
// })


// var trainAccuracy = classifier.confusionMatrix().accuracy(); // not valid for probability
// print('trainAccuracy', trainAccuracy);

var classified = data_base.select(bands).clip(limits).classify(classifier);
// // Map.addLayer(classified.reproject(deforestation.projection().atScale(100)), {min:0, max:1}, 'classified');

// var testAccuracy = validation
//     .classify(classifier)
//     .errorMatrix('cluster', 'classification')
//     .accuracy();
// print('testAccuracy', testAccuracy);                 //only for classification
// print(validation
//     .classify(classifier)
//     .errorMatrix('cluster', 'classification'))

// var validation_classified = validation.classify(classifier)
// Export.table.toDrive({
//   collection:validation_classified, 
//   description:'validation_classified_rf_iquitos'}      //all classified training points are exported
//   )
// Export.image.toAsset({
//   image:classified.clip(limits), 
//   description:'classified_rf_prob_iquitos', 
//   assetId:'classified_rf_prob_iquitos', 
//   region:geometry, 
//   scale:100, 
//   maxPixels:1e12})


// // var validation_classified_csv = ee.FeatureCollection('ft:1gR0EUqeTM6qKz56nmlAPxDLxhrDsfsFkMxxe1PK6');
// // var validation_classified_csv = ee.FeatureCollection('ft:1DhMhvOt8ITdfUr7X12VKe1NbeWMAZl7JhLDtT-f6'); //-rate -lonlat
// var validation_classified_csv = ee.FeatureCollection('ft:1WzoVOzwRjNpB24cBOQtZd4ze0eKcerqSD7n6b_HY'); 



// // ROC Curve 
// var ROC_field = 'classification', ROC_min = 0, ROC_max = 1, ROC_steps = 100, ROC_points = validation_classified_csv

// var ROC = ee.FeatureCollection(ee.List.sequence(ROC_min, ROC_max, null, ROC_steps).map(function (cutoff) {
//   var target_roc = ROC_points.filterMetadata('cluster','equals',1)
//   // true-positive-rate, sensitivity  
//   var TPR = ee.Number(target_roc.filterMetadata(ROC_field,'greater_than',cutoff).size()).divide(target_roc.size()) 
//   var non_target_roc = ROC_points.filterMetadata('cluster','equals',0)
//   // true-negative-rate, specificity  
//   var TNR = ee.Number(non_target_roc.filterMetadata(ROC_field,'less_than',cutoff).size()).divide(non_target_roc.size()) 
//   return ee.Feature(null,{cutoff: cutoff, TPR: TPR, TNR: TNR, FPR:TNR.subtract(1).multiply(-1),  dist:TPR.subtract(1).pow(2).add(TNR.subtract(1).pow(2)).sqrt()})
// }))
// // Use trapezoidal approximation for area under curve (AUC)
// var X = ee.Array(ROC.aggregate_array('FPR')), 
//     Y = ee.Array(ROC.aggregate_array('TPR')), 
//     Xk_m_Xkm1 = X.slice(0,1).subtract(X.slice(0,0,-1)),
//     Yk_p_Ykm1 = Y.slice(0,1).add(Y.slice(0,0,-1)),
//     AUC = Xk_m_Xkm1.multiply(Yk_p_Ykm1).multiply(0.5).reduce('sum',[0]).abs().toList().get(0)
// print(AUC,'Area under curve')
// // Plot the ROC curve
// print(ui.Chart.feature.byFeature(ROC, 'FPR', 'TPR').setOptions({
//       title: 'ROC curve',
//       legend: 'none',
//       hAxis: { title: 'False-positive-rate'},
//       vAxis: { title: 'True-negative-rate'},
//       lineWidth: 1}))
// // find the cutoff value whose ROC point is closest to (0,1) (= "perfect classification")      
// var ROC_best = ROC.sort('dist').first().get('cutoff').aside(print,'best ROC point cutoff')


///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////SOME RSESULTS
// ['distance_dep','distance_vec','distance_nac','altitude','distance_parks','distance_buffer',
//               'distance_villages','latitude','longitude','distance_any','cluster_mean','carbon_density']
// trainAccuracy
// 0.8952747741075396
// testAccuracy
// 0.898718836565097
// [[2391,398],[187,2800]]
// 0: [2391,398]
// 1: [187,2800]

// var bands =  ['distance_dep','distance_vec','distance_nac','altitude','distance_parks','distance_buffer',
//               'distance_villages','latitude','longitude','distance_any','cluster_mean']; //  - carbon_density
// trainAccuracy
// 0.8944600799881499
// testAccuracy
// 0.8988919667590027
// [[2396,393],[191,2796]]
// 0: [2396,393]
// 1: [191,2796]

// var bands =  ['distance_dep','distance_vec','distance_nac','altitude','distance_parks','distance_buffer',
//               'distance_villages','latitude','longitude','distance_any']; //  - carbon_density, -cluster_mean

// trainAccuracy
// 0.8003258776477559
// testAccuracy
// 0.8156163434903048
// [[2057,732],[333,2654]]
// 0: [2057,732]
// 1: [333,2654]

// var bands =  ['distance_dep','distance_vec','distance_nac','altitude','distance_parks','distance_buffer',
//               'distance_villages','distance_any']; //  - carbon_density, -cluster_mean, -lotlan

// TrainAccuracy
// 0.7962524070508072
// testAccuracy
// 0.8088642659279779
// [[2028,761],[343,2644]]
// 0: [2028,761]
// 1: [343,2644]

// var bands =  ['distance_dep','distance_vec','distance_nac','altitude','distance_parks','distance_buffer',
//               'distance_villages','latitude','longitude','distance_any']; //  - carbon_density, -cluster_mean
// trainAccuracy
// 0.6898113768008317
// testAccuracy
// 0.6853062629043358
// [[1796,960],[869,2187]]
// 0: [1796,960]
// 1: [869,2187]



// var to_predict_all= ee.Image.cat(to_predict,defo_7x7,carbon_density)
var to_predict_all= ee.Image.cat(to_predict_v5,defo_7x7) //version 2
// printing predicted
var predict_bands =  ['distance_dep_proj','distance_vec','distance_nac_proj','altitude','distance_parks','distance_buffer',
              'distance_villages','latitude','longitude','distance_any'];
// var predict_bands =  ['distance_dep_proj','distance_vec','distance_nac_proj','altitude','distance_parks','distance_buffer',
//               'distance_villages','distance_any','cluster_mean']; //-lon -lat

var classified_pred = to_predict_all.select(predict_bands,bands).clip(limits).classify(classifier);
Export.image.toAsset({
  image:classified_pred.clip(limits), 
  description:'predicted_all_nocarb_prob_C1', 
  assetId:'predicted_all_nocarb_prob_C1', 
  region:geometry, 
  scale:100, 
  maxPixels:1e12})
// Map.addLayer(db_2,{},'database')
// Map.addLayer(to_predict,{},'to_predict')
// Map.addLayer(image9,class_vis,'nolonlat')

///Exporting to cloud storage
// Export.image.toCloudStorage({
//   image: to_predict_all.select(predict_bands,bands),
//   bucket:'gs://road_detection/road_detection/data',
//   description: 'to_predict_v2',
//   scale: 100,
//   fileFormat: 'TFRecord',
//   region: geometry4,
//   formatOptions: {
//     'patchDimensions': [256, 256],
//     maxFileSize: 104857600,
//     compressed: true,
//   },
// });
Map.addLayer(cluster_mdd.clip(roi_mdd))
Map.addLayer(roi_mdd)
Map.addLayer(all_roads, {"color":"00FF00"})