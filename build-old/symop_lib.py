#!/usr/bin/env python

import shlex
import json
from json import encoder
from collections import OrderedDict, defaultdict

encoder.FLOAT_REPR = lambda o: format(o, '.2f')


def main(argv=None):

    symop_dict = OrderedDict()
    HM = ""

    with open("data/symop.lib", "r") as fp:
        for line in fp:
            if line.strip() == "":
                continue
            if line.startswith(" "):
                symop_dict[HM].append(line.strip().replace(" ", ""))
            else:
                ls = shlex.split(line.split("!")[0])
                HM = ls[6]
                symop_dict[HM] = []

    op_dict = defaultdict(int)
    part_dict = defaultdict(int)
    code_dict = {}
    decode_dict = OrderedDict()
    symop_dict2 = OrderedDict()
    i = 32

    for k, v in symop_dict.items():
        v2 = []
        for op in v:
            op_dict[op] += 1
            for part in op.split(","):
                part_dict[part] += 1
                if part not in code_dict:
                    code_dict[part] = chr(i)
                    decode_dict[chr(i)] = part
                    i += 1
                    if i == 34:  # avoid " character
                        i += 1
                    if i == 92:  # avoid \ character
                        i += 1
                v2.append(code_dict[part])
        symop_dict2[k] = "".join(v2)

    print(json.dumps(code_dict, indent=4))
    print(len(code_dict))

    print(json.dumps(decode_dict, indent=4))
    print(len(decode_dict))

    # print(json.dumps(op_dict, indent=4))
    # print(len(op_dict))
    # print(max(op_dict.values()))

    # print(json.dumps(part_dict, indent=4))
    # print(len(part_dict))
    # print(max(part_dict.values()))

    # print(json.dumps(symop_dict, indent=4))
    print(json.dumps(symop_dict2, indent=4))


if __name__ == "__main__":
    main()
