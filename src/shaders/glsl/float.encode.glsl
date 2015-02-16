/*
Float encoding technique by
Carlos Scheidegger
https://github.com/cscheid/lux/blob/master/src/shade/bits/encode_float.js

Conversion to GLSL by:
http://concord-consortium.github.io/lab/experiments/webgl-gpgpu/script.js
*/

float shift_right(float v, float amt) { 
  v = floor(v) + 0.5; 
  return floor(v / exp2(amt)); 
}

float shift_left(float v, float amt) { 
  return floor(v * exp2(amt) + 0.5); 
}

float mask_last(float v, float bits) { 
  return mod(v, shift_left(1.0, bits)); 
}

float extract_bits(float num, float from, float to) { 
  from = floor(from + 0.5); to = floor(to + 0.5); 
  return mask_last(shift_right(num, from), to - from); 
}

vec4 encode_float(float val) { 
  if (val == 0.0) return vec4(0, 0, 0, 0); 
  float valuesign = val > 0.0 ? 0.0 : 1.0; 
  val = abs(val); 
  float exponent = floor(log2(val)); 
  float biased_exponent = exponent + 127.0; 
  float fraction = ((val / exp2(exponent)) - 1.0) * 8388608.0; 
  float t = biased_exponent / 2.0; 
  float last_bit_of_biased_exponent = fract(t) * 2.0; 
  float remaining_bits_of_biased_exponent = floor(t); 
  float byte4 = extract_bits(fraction, 0.0, 8.0) / 255.0; 
  float byte3 = extract_bits(fraction, 8.0, 16.0) / 255.0; 
  float byte2 = (last_bit_of_biased_exponent * 128.0 + extract_bits(fraction, 16.0, 23.0)) / 255.0; 
  float byte1 = (valuesign * 128.0 + remaining_bits_of_biased_exponent) / 255.0; 
  return vec4(byte4, byte3, byte2, byte1); 
}
