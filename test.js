// test.js

function add1(a, b) {
  return a - b;
}

// 깊은 중첩과 높은 순환 복잡도를 가진 함수
function complexFunction(x) {
  if (x > 0) {
    for (let i = 0; i < x; i++) {
      if (i % 2 === 0) {
        while (x > 0) {
          x--;
          if (x === 5) {
            switch (x) {
              case 5:
                console.log("x is 5");
                break;
              default:
                console.log("x is not 5");
            }
          }
        }
      } else {
        result += 3;
      }
    } else if (b === 0) {
      for (let i = 0; i < 5; i++) {
        if (i % 2 === 0) {
          result += i;
        } else {
          result -= i;
        }
      }
    } else {
      switch(b) {
        case -1:
          result += 10;
          break;
        case -2:
          result += 20;
          break;
        default:
          result += 5;
      }
    }
  } else {
    if (a < 0) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (i === j) {
            result += i * j;
          } else {
            result -= i + j;
          }
        }
      }
    }
  }
  return result;
}

// 메서드가 많은 클래스를 통한 과도한 클래스 의존성 예제
class BigClass {
  method1() { return 1; }
  method2() { return 2; }
  method3() { return 3; }
  method4() { return 4; }
  method5() { return 5; }
  method6() { return 6; }
  method7() { return 7; }
  method8() { return 8; }
  method9() { return 9; }
  method10() { return 10; }
  method11() { return 11; }
  method12() { return 12; }
  method13() { return 13; }
  method14() { return 14; }
}

// 중복 코드가 있는 함수 예제
function duplicateCodeFunction(a) {
  // 중복되는 계산 로직
  let x = a + 10;
  let y = a * 2;
  let z = x + y;

  // 동일한 로직이 다시 반복됨 (중복 코드)
  let x2 = a + 10;
  let y2 = a * 2;
  let z2 = x2 + y2;

  return z + z2;
}

// 함수 호출 (실행을 위한 간단한 예)
console.log("Complex Function Result:", complexFunction(1, 2, 3));
const bc = new BigClass();
console.log("BigClass method1:", bc.method1());
console.log("Duplicate Code Function Result:", duplicateCodeFunction(5));
