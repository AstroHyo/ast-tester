// Test.js - 의도적으로 문제를 포함한 테스트 파일

// 중복 함수 선언 (strict mode에서는 에러 발생)
function add1(a, b) {
  return a + b;
}

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
        do {
          x--;
        } while (x > 0);
      }
    }
  } else {
    try {
      // 의도적인 에러: 정의되지 않은 함수를 호출함.
      undefinedFunctionCall();
    } catch (e) {
      console.error("Caught error:", e);
    }
  }
}

// 메서드가 과도하게 많은 클래스를 통한 코드 스멜 예시
class OverloadedClass {
  method1() {}
  method2() {}
  method3() {}
  method4() {}
  method5() {}
  method6() {}
  method7() {}
  method8() {}
  method9() {}
  method10() {}
  method11() {}
}

// 중첩 함수와 조건문이 포함된 화살표 함수
const anotherComplex = (a, b) => {
  const inner = (c) => {
    if (c > 10) {
      return c * 2;
    } else {
      return c / 2;
    }
  };
  let result = 0;
  for (let i = 0; i < a; i++) {
    if (i % 3 === 0) {
      result += inner(i);
    } else {
      result += i;
    }
  }
  return result;
};
